import {
	type Order,
	OrderStatus,
	Prisma,
	type PrismaClient,
	type Product,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { authenticateUserCavos } from "~/server/services/cavos";
import { balanceOf } from "~/server/contracts/cofi_collection";
import { getProductPrices, buyProduct } from "~/server/contracts/marketplace";
import type { PaymentToken } from "~/utils/contracts";
import { getBalances, increaseAllowance, transfer } from "~/server/contracts/erc20";
import { CofiBlocksContracts } from "~/utils/contracts";

interface Collectible {
	id: number;
	tokenId: number;
	name: string;
	metadata: string | null;
	totalQuantity: number;
}


type DeliveryAddress = {
	street: string
	apartment: string | undefined
	city: string
	zipCode: string
}

type ShoppingCart = {
	id: string
	userId: string
	items: {
		id: string
		product: Product
		quantity: number,
		is_grounded: boolean,
	}[]
}
async function getUserCartForCreateOrder(
	db: PrismaClient,
	cartId: string,
	userId: string,
	deliveryMethod: string | undefined,
	deliveryAddress: DeliveryAddress | undefined
): Promise<ShoppingCart> {
	const cart = await db.shoppingCart.findFirst({
		where: { id: cartId, userId: userId },
		include: { items: { include: { product: true } } },
	});
	if (!cart) throw new TRPCError({ code: "NOT_FOUND", message: "Cart not found" });
	if (!cart.items.length) throw new TRPCError({ code: "BAD_REQUEST", message: "Cart is empty" });

	// 2) Home delivery constraints
	if (deliveryMethod === "home") {
		const owners = new Set(cart.items.map(i => i.product.owner).filter(Boolean));
		if (owners.size !== 1) {
			throw new TRPCError({ code: "BAD_REQUEST", message: "Home delivery requires single seller" });
		}
		if (!deliveryAddress) {
			throw new TRPCError({ code: "BAD_REQUEST", message: "Address required for home delivery" });
		}
	}
	return cart;
}

function getCartTotalInWei(cart: ShoppingCart, lineTotals: Record<string, number>): bigint {
	const total = cart.items.reduce<bigint>((acc, i) => {
		const k = i.product.tokenId.toString();
		const v = lineTotals[k];
		if (v == null) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Price missing" });
		return acc + BigInt(v.toString());
	}, 0n)
	return total;
}

// Calculate total with market fee (50%)
const MARKET_FEE_BPS = 5000; // 50%
const calculatePriceWithMarketFee = (price: number): number => {
	const fee = (price * MARKET_FEE_BPS) / 10000;
	const raw_price = price + fee;
	return Math.round(raw_price * 100) / 100;
};

async function checkUserBalance(db: PrismaClient, userId: string, paymentToken: PaymentToken, totalWei: bigint) {
	const userdb = await db.user.findUnique({ where: { id: userId }, select: { walletAddress: true } });
	if (!userdb?.walletAddress) throw new TRPCError({ code: "NOT_FOUND", message: "Wallet not set" });

	const balance = await getBalances(userdb.walletAddress, paymentToken, false);
	// ^ make sure this returns BigInt in smallest units
	console.log(`Balance check: wallet=${userdb.walletAddress}, token=${paymentToken}, balance=${balance.toString()}`);
	if (balance < totalWei) {
		console.log("Insufficient balance error");
		throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient balance" });
	}
	console.log("Balance check passed");
}

export const orderRouter = createTRPCRouter({
	// Get a specific order
	getOrder: protectedProcedure
		.input(
			z.object({
				orderId: z.string(),
			}),
		)
		.query(async ({ ctx, input }) => {
			return ctx.db.order.findUnique({
				where: { id: input.orderId },
				include: {
					items: {
						include: {
							product: true,
						},
					},
					user: true,
				},
			});
		}),

	getOrderItem: protectedProcedure
		.input(z.object({ orderItemId: z.string() }))
		.query(async ({ ctx, input }) => {
			console.log("orderItemId", input.orderItemId);
			return ctx.db.orderItem.findUnique({
				where: { id: input.orderItemId },
				include: {
					product: true,
					order: {
						include: {
							user: true,
						},
					},
					seller: true,
				},
			});
		}),

	getOrderDelivery: protectedProcedure
		.input(z.object({ orderId: z.string() }))
		.query(async ({ ctx, input }) => {
			const order = await ctx.db.order.findUnique({
				where: { id: input.orderId }
			});
			if (!order) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
			}
			if (!order.home_delivery) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Order is not a home delivery" });
			}
			return ctx.db.delivery.findFirst({
				where: { orderId: input.orderId, status: "PENDING" },
			});
		}),

	// Get user's orders
	getUserOrders: protectedProcedure.query(async ({ ctx }) => {
		// Get user ID from session
		const userId = ctx.session?.user?.id;

		if (!userId) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "User not authenticated",
			});
		}

		return ctx.db.order.findMany({
			where: { userId },
			include: {
				items: {
					include: {
						product: true,
						seller: true,
					},
				},
				user: true,
			},
			orderBy: { createdAt: "desc" },
		});
	}),

	// Get producer's sales
	getProducerOrders: protectedProcedure.query(async ({ ctx }) => {
		// Verify the user is a producer
		if (!ctx.session.user) {
			throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });
		}
		if (ctx.session.user.role !== "COFFEE_PRODUCER" && ctx.session.user.role !== "COFFEE_ROASTER") {
			throw new TRPCError(
				{ code: "UNAUTHORIZED", message: "Only producers and roasters can access their sales" }
			);
		}

		return ctx.db.orderItem.findMany({
			where: { sellerId: ctx.session.user.id },
			include: {
				order: {
					include: {
						user: true,
					},
				},
				product: true,
			},
			orderBy: { order: { createdAt: "desc" } },
		});
	}),

	// Create a new order
	createOrder: protectedProcedure
		.input(
			z.object({
				cartId: z.string(),
				paymentToken: z.enum(["STRK", "USDC", "USDT"]),
				deliveryAddress: z.object({
					street: z.string(),
					apartment: z.string().optional(),
					city: z.string(),
					zipCode: z.string(),
				}).optional(),
				deliveryMethod: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }): Promise<Order> => {
			const { user } = ctx.session;
			if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

			// 1) Load cart with ownership check
			const cart = await getUserCartForCreateOrder(
				ctx.db, input.cartId, user.id, input.deliveryMethod, input.deliveryAddress as DeliveryAddress
			);
			console.log("Cart loaded:", cart);

			// 3) BigInt pricing
			// Assuming getProductPrices returns per-line TOTAL price in smallest units (BigInt)
			const tokenIds = cart.items.map(i => BigInt(i.product.tokenId));
			const tokenAmounts = cart.items.map(i => BigInt(i.quantity));
			const lineTotals = await getProductPrices(tokenIds, tokenAmounts, input.paymentToken as PaymentToken, false);

			const totalWei = getCartTotalInWei(cart, lineTotals);
			const buffer = (totalWei * 101n) / 100n; // +1%

			await checkUserBalance(ctx.db, user.id, input.paymentToken as PaymentToken, totalWei);

			// 5) Start DB transaction for stock + order creation only (no network I/O)
			const order = await ctx.db.$transaction(async (tx) => {
				// Validate and atomically decrement stocks per line
				for (const item of cart.items) {
					const qty = item.quantity;
					console.log(
						'Updating stock for item:',
						item.product.name,
						'item id',
						item.product.id,
						'quantity:',
						qty
					);
					// Conditional update for variant + total stock
					const res = await tx.product.updateMany({
						where: {
							id: item.product.id,
							stock: { gte: qty },
							...(item.is_grounded ? { ground_stock: { gte: qty } } : { bean_stock: { gte: qty } }),
						},
						data: {
							stock: { decrement: qty },
							...(item.is_grounded ? { ground_stock: { decrement: qty } } : { bean_stock: { decrement: qty } }),
						},
					});
					if (res.count !== 1) {
						throw new TRPCError({ code: "BAD_REQUEST", message: `Insufficient stock for ${item.product.name}` });
					}
				}

				const orderId = crypto.randomUUID();

				const totalUsd = cart.items.reduce((s, i) => {
					const itemTotalPrice = calculatePriceWithMarketFee(i.product.price);
					console.log(`Price calculation for ${i.product.name}: base=${i.product.price}, total=${itemTotalPrice}, quantity=${i.quantity}`);
					return s + itemTotalPrice * i.quantity;
				}, 0);
				console.log(`Order total calculated: ${totalUsd}`);

				const created = await tx.order.create({
					data: {
						id: orderId,
						userId: user.id,
						total: totalUsd,
						status: OrderStatus.PENDING,
						home_delivery: input.deliveryMethod === "home",
					},
					include: { items: true },
				});

				// Create order items (DB only)
				for (const item of cart.items) {
					const itemTotalPrice = calculatePriceWithMarketFee(item.product.price);
					await tx.orderItem.create({
						data: {
							orderId: created.id,
							productId: item.product.id,
							quantity: item.quantity,
							price: itemTotalPrice, // USD display price with market fee
							is_grounded: item.is_grounded,
							sellerId: item.product.owner ?? "",
						},
					});
				}

				// Create delivery record (no on-chain yet)
				if (input.deliveryMethod === "home" && input.deliveryAddress) {
					await tx.delivery.create({
						data: {
							orderId: created.id,
							province: input.deliveryAddress.city,
							address: `${input.deliveryAddress.street}${input.deliveryAddress.apartment ? `, ${input.deliveryAddress.apartment}` : ""}, ${input.deliveryAddress.city}, ${input.deliveryAddress.zipCode}`,
							status: "PENDING",
						},
					});
				}

				// Clear cart
				await tx.shoppingCartItem.deleteMany({ where: { shoppingCartId: cart.id } });
				await tx.shoppingCart.delete({ where: { id: cart.id } });
				return created;
			}, {
				isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
				timeout: 8000,
			});

			// 6) On-chain phase (outside DB tx): approve & buy per line
			console.log("Starting payment process for order:", order.id);
			console.log("Payment token:", input.paymentToken);
			console.log("Buffer amount:", buffer.toString());

			const userAuth = await authenticateUserCavos(user.email ?? "", ctx.db);
			console.log("User authenticated, wallet address:", userAuth.wallet_address);

			console.log("Increasing allowance...");
			await increaseAllowance(buffer, input.paymentToken as PaymentToken, CofiBlocksContracts.MARKETPLACE, userAuth);
			console.log("Allowance increased successfully");

			// Execute purchases; if any fails, mark order accordingly, and (optionally) restore stock in a compensating tx
			try {
				// Do the buys
				console.log("Starting product purchases...");
				for (const item of cart.items) {
					console.log(`Buying product ${item.product.tokenId}, quantity: ${item.quantity}`);
					const txHash = await buyProduct(
						BigInt(item.product.tokenId),
						BigInt(item.quantity),
						input.paymentToken as PaymentToken,
						userAuth
					);
					console.log(`Product ${item.product.tokenId} purchased, tx hash: ${txHash}`);
					await ctx.db.orderItem.updateMany({
						where: { orderId: order.id, productId: item.product.id },
						data: { payment_tx_hash: txHash },
					});
				}
				console.log("All products purchased successfully");

				// Delivery fee
				if (order.home_delivery) {
					console.log("Processing home delivery fee...");
					const owner = await ctx.db.user.findUnique(
						{ where: { id: cart.items[0]?.product.owner ?? "" }, select: { walletAddress: true } });
					if (!owner?.walletAddress) {
						throw new TRPCError({ code: "NOT_FOUND", message: "Owner wallet not found" });
					}
					console.log("Owner wallet found:", owner.walletAddress);

					// Calculate delivery fee using the same logic as getDeliveryFee
					const DELIVERY_PRICES = {
						GAM: 4,
						OUTSIDE: 5.5,
					} as const;

					const gam = ["san_jose", "alajuela", "cartago", "heredia"];
					const normalizeProvince = (province: string): string => {
						return province
							.toLowerCase()
							.trim()
							.replace(/[,\s]+/g, '_')
							.replace(/[^a-z_]/g, '')
							.replace(/_+/g, '_')
							.replace(/^_|_$/g, '');
					};

					const normalizedProvince = normalizeProvince(input.deliveryAddress?.city ?? "");
					const isGAM = gam.includes(normalizedProvince);
					const basePrice = isGAM ? DELIVERY_PRICES.GAM : DELIVERY_PRICES.OUTSIDE;

					// Calculate total package count from cart items
					const totalPackageCount = cart.items.reduce((total, item) => total + item.quantity, 0);

					// Calculate shipping price based on package count
					let totalPrice = basePrice;
					if (totalPackageCount > 2) {
						const additionalPackages = totalPackageCount - 2;
						const additionalGroups = Math.ceil(additionalPackages / 2);
						totalPrice = basePrice + (additionalGroups * 2);
					}

					console.log(`Delivery fee calculation: basePrice=${basePrice}, packageCount=${totalPackageCount}, totalPrice=${totalPrice}`);
					const deliveryFeeUnits = BigInt(Math.round(totalPrice * (10 ** 6)));
					console.log("Sending delivery fee:", deliveryFeeUnits.toString());

					const feeTx = await transfer(deliveryFeeUnits, input.paymentToken as PaymentToken, owner.walletAddress, userAuth);
					console.log("Delivery fee sent, tx hash:", feeTx);
					await ctx.db.delivery.updateMany(
						{
							where: { orderId: order.id },
							data: { payment_tx_hash: feeTx }
						});
				}

				// Mark order paid
				const finalOrder = await ctx.db.order.update({
					where: { id: order.id },
					data: { status: OrderStatus.PENDING },
					include: { items: true },
				});
				return finalOrder;

			} catch (e) {
				// Mark failed; (optional) enqueue compensating restock job
				console.error("Payment failed with error:", e);
				await ctx.db.order.update({ where: { id: order.id }, data: { status: OrderStatus.FAILED } });
				const errorMessage = e instanceof Error ? e.message : "Unknown payment error";
				throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Payment failed: ${errorMessage}`, cause: e });
			}
		}),

	// Create a new order
	createMistOrder: protectedProcedure
		.input(
			z.object({
				cartId: z.string(),
				paymentToken: z.enum(["STRK", "USDC", "USDT"]),
				deliveryAddress: z.object({
					street: z.string(),
					apartment: z.string().optional(),
					city: z.string(),
					zipCode: z.string(),
				}).optional(),
				deliveryMethod: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }): Promise<Order> => {
			const { user } = ctx.session;
			if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

			// 1) Load cart with ownership check
			const cart = await getUserCartForCreateOrder(
				ctx.db, input.cartId, user.id, input.deliveryMethod, input.deliveryAddress as DeliveryAddress
			);
			console.log("Cart loaded:", cart);

			// 3) BigInt pricing
			// Assuming getProductPrices returns per-line TOTAL price in smallest units (BigInt)
			const tokenIds = cart.items.map(i => BigInt(i.product.tokenId));
			const tokenAmounts = cart.items.map(i => BigInt(i.quantity));
			const lineTotals = await getProductPrices(tokenIds, tokenAmounts, input.paymentToken as PaymentToken, false);

			const totalWei = getCartTotalInWei(cart, lineTotals);
			const buffer = (totalWei * 101n) / 100n; // +1%

			await checkUserBalance(ctx.db, user.id, input.paymentToken as PaymentToken, totalWei);

			// 5) Start DB transaction for stock + order creation only (no network I/O)
			const order = await ctx.db.$transaction(async (tx) => {
				// Validate and atomically decrement stocks per line
				for (const item of cart.items) {
					const qty = item.quantity;
					console.log(
						'Updating stock for item:',
						item.product.name,
						'item id',
						item.product.id,
						'quantity:',
						qty
					);
					// Conditional update for variant + total stock
					const res = await tx.product.updateMany({
						where: {
							id: item.product.id,
							stock: { gte: qty },
							...(item.is_grounded ? { ground_stock: { gte: qty } } : { bean_stock: { gte: qty } }),
						},
						data: {
							stock: { decrement: qty },
							...(item.is_grounded ? { ground_stock: { decrement: qty } } : { bean_stock: { decrement: qty } }),
						},
					});
					if (res.count !== 1) {
						throw new TRPCError({ code: "BAD_REQUEST", message: `Insufficient stock for ${item.product.name}` });
					}
				}

				const orderId = crypto.randomUUID();

				const totalUsd = cart.items.reduce((s, i) => {
					const itemTotalPrice = calculatePriceWithMarketFee(i.product.price);
					console.log(`Price calculation for ${i.product.name}: base=${i.product.price}, total=${itemTotalPrice}, quantity=${i.quantity}`);
					return s + itemTotalPrice * i.quantity;
				}, 0);
				console.log(`Order total calculated: ${totalUsd}`);

				const created = await tx.order.create({
					data: {
						id: orderId,
						userId: user.id,
						total: totalUsd,
						status: OrderStatus.PENDING,
						home_delivery: input.deliveryMethod === "home",
					},
					include: { items: true },
				});

				// Create order items (DB only)
				for (const item of cart.items) {
					const itemTotalPrice = calculatePriceWithMarketFee(item.product.price);
					await tx.orderItem.create({
						data: {
							orderId: created.id,
							productId: item.product.id,
							quantity: item.quantity,
							price: itemTotalPrice, // USD display price with market fee
							is_grounded: item.is_grounded,
							sellerId: item.product.owner ?? "",
						},
					});
				}

				// Create delivery record (no on-chain yet)
				if (input.deliveryMethod === "home" && input.deliveryAddress) {
					await tx.delivery.create({
						data: {
							orderId: created.id,
							province: input.deliveryAddress.city,
							address: `${input.deliveryAddress.street}${input.deliveryAddress.apartment ? `, ${input.deliveryAddress.apartment}` : ""}, ${input.deliveryAddress.city}, ${input.deliveryAddress.zipCode}`,
							status: "PENDING",
						},
					});
				}

				// Clear cart
				await tx.shoppingCartItem.deleteMany({ where: { shoppingCartId: cart.id } });
				await tx.shoppingCart.delete({ where: { id: cart.id } });
				return created;
			}, {
				isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
				timeout: 8000,
			});

			// 6) On-chain phase (outside DB tx): approve & buy per line
			console.log("Starting payment process for order:", order.id);
			console.log("Payment token:", input.paymentToken);
			console.log("Buffer amount:", buffer.toString());

			const userAuth = await authenticateUserCavos(user.email ?? "", ctx.db);
			console.log("User authenticated, wallet address:", userAuth.wallet_address);

			console.log("Increasing allowance...");
			await increaseAllowance(buffer, input.paymentToken as PaymentToken, CofiBlocksContracts.MARKETPLACE, userAuth);
			console.log("Allowance increased successfully");

			// Execute purchases; if any fails, mark order accordingly, and (optionally) restore stock in a compensating tx
			try {
				// Do the buys
				console.log("Starting product purchases...");
				for (const item of cart.items) {
					console.log(`Buying product ${item.product.tokenId}, quantity: ${item.quantity}`);
					const txHash = await buyProduct(
						BigInt(item.product.tokenId),
						BigInt(item.quantity),
						input.paymentToken as PaymentToken,
						userAuth
					);
					console.log(`Product ${item.product.tokenId} purchased, tx hash: ${txHash}`);
					await ctx.db.orderItem.updateMany({
						where: { orderId: order.id, productId: item.product.id },
						data: { payment_tx_hash: txHash },
					});
				}
				console.log("All products purchased successfully");

				// Delivery fee
				if (order.home_delivery) {
					console.log("Processing home delivery fee...");
					const owner = await ctx.db.user.findUnique(
						{ where: { id: cart.items[0]?.product.owner ?? "" }, select: { walletAddress: true } });
					if (!owner?.walletAddress) {
						throw new TRPCError({ code: "NOT_FOUND", message: "Owner wallet not found" });
					}
					console.log("Owner wallet found:", owner.walletAddress);

					// Calculate delivery fee using the same logic as getDeliveryFee
					const DELIVERY_PRICES = {
						GAM: 4,
						OUTSIDE: 5.5,
					} as const;

					const gam = ["san_jose", "alajuela", "cartago", "heredia"];
					const normalizeProvince = (province: string): string => {
						return province
							.toLowerCase()
							.trim()
							.replace(/[,\s]+/g, '_')
							.replace(/[^a-z_]/g, '')
							.replace(/_+/g, '_')
							.replace(/^_|_$/g, '');
					};

					const normalizedProvince = normalizeProvince(input.deliveryAddress?.city ?? "");
					const isGAM = gam.includes(normalizedProvince);
					const basePrice = isGAM ? DELIVERY_PRICES.GAM : DELIVERY_PRICES.OUTSIDE;

					// Calculate total package count from cart items
					const totalPackageCount = cart.items.reduce((total, item) => total + item.quantity, 0);

					// Calculate shipping price based on package count
					let totalPrice = basePrice;
					if (totalPackageCount > 2) {
						const additionalPackages = totalPackageCount - 2;
						const additionalGroups = Math.ceil(additionalPackages / 2);
						totalPrice = basePrice + (additionalGroups * 2);
					}

					console.log(`Delivery fee calculation: basePrice=${basePrice}, packageCount=${totalPackageCount}, totalPrice=${totalPrice}`);
					const deliveryFeeUnits = BigInt(Math.round(totalPrice * (10 ** 6)));
					console.log("Sending delivery fee:", deliveryFeeUnits.toString());

					const feeTx = await transfer(deliveryFeeUnits, input.paymentToken as PaymentToken, owner.walletAddress, userAuth);
					console.log("Delivery fee sent, tx hash:", feeTx);
					await ctx.db.delivery.updateMany(
						{
							where: { orderId: order.id },
							data: { payment_tx_hash: feeTx }
						});
				}

				// Mark order paid
				const finalOrder = await ctx.db.order.update({
					where: { id: order.id },
					data: { status: OrderStatus.PENDING },
					include: { items: true },
				});
				return finalOrder;

			} catch (e) {
				// Mark failed; (optional) enqueue compensating restock job
				console.error("Payment failed with error:", e);
				await ctx.db.order.update({ where: { id: order.id }, data: { status: OrderStatus.FAILED } });
				const errorMessage = e instanceof Error ? e.message : "Unknown payment error";
				throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Payment failed: ${errorMessage}`, cause: e });
			}
		}),

	getDeliveryFee: protectedProcedure.input(z.object({
		province: z.string(),
		packageCount: z.number().optional().default(1)
	})).query(async ({ input }) => {
		if (input.province === "") {
			return 0;
		}

		// Hardcoded delivery prices (matching frontend)
		const DELIVERY_PRICES = {
			GAM: 4,
			OUTSIDE: 5.5,
		} as const;

		// GAM provinces with improved normalization
		const gam = ["san_jose", "alajuela", "cartago", "heredia"];

		// Normalize province name - handle various formats
		const normalizeProvince = (province: string): string => {
			return province
				.toLowerCase()
				.trim()
				.replace(/[,\s]+/g, '_') // Replace commas and spaces with underscores
				.replace(/[^a-z_]/g, '') // Remove any non-alphabetic characters except underscores
				.replace(/_+/g, '_') // Replace multiple underscores with single
				.replace(/^_|_$/g, ''); // Remove leading/trailing underscores
		};

		const normalizedProvince = normalizeProvince(input.province);

		// Determine if province is in GAM
		const isGAM = gam.includes(normalizedProvince);
		const basePrice = isGAM ? DELIVERY_PRICES.GAM : DELIVERY_PRICES.OUTSIDE;

		// Calculate shipping price based on package count
		// 1-2 packages: base price
		// 3-4 packages: base price + $2
		// 5-6 packages: base price + $4
		// And so on...
		let totalPrice = basePrice;
		if (input.packageCount > 2) {
			const additionalPackages = input.packageCount - 2;
			const additionalGroups = Math.ceil(additionalPackages / 2);
			totalPrice = basePrice + (additionalGroups * 2);
		}

		return totalPrice;
	}),

	// Get user's NFT collectibles
	getUserCollectibles: protectedProcedure.query(async ({ ctx }) => {
		if (!ctx.session.user) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "User not authenticated",
			});
		}

		const user = await ctx.db.user.findUnique({
			where: { id: ctx.session.user.id }
		});

		if (!user?.walletAddress) {
			return [];
		}

		try {
			// Get products from orders
			const orders = await ctx.db.order.findMany({
				where: { userId: ctx.session.user.id },
				include: {
					items: {
						include: {
							product: true,
						},
					},
				},
			});
			const products = orders.flatMap((order) => order.items.map((item) => item.product));

			// Authenticate with Cavos
			if (!user.email) {
				throw new Error("User email not found");
			}
			const userAuthData = await authenticateUserCavos(
				user.email,
				ctx.db,
			);

			// Get balances for each product
			const collectibles = await Promise.all(
				products.map(async (product) => {
					try {
						const balance = await balanceOf(
							userAuthData,
							BigInt(product.tokenId),
						);

						if (Number(balance) === 0) {
							return null;
						}

						return {
							id: product.id,
							tokenId: product.tokenId,
							name: product.name,
							metadata: product.nftMetadata,
							totalQuantity: Number(balance),
						};
					} catch (error) {
						console.error(
							`Error fetching balance for token ${product.tokenId}:`,
							error,
						);
						return null;
					}
				}),
			);
			// Filter out null values (tokens with 0 balance or errors)
			return collectibles.filter((item): item is Collectible => item !== null);
		} catch (error) {
			console.error("Error fetching NFT balances:", error);
			return [];
		}
	}),

});
