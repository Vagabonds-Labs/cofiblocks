import {
	type Order,
	OrderStatus,
	Prisma,
	type Product,
	type User,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { registerUser } from "~/services/cavos";
import { balanceOf } from "~/services/contracts/cofi_collection";

interface Collectible {
	id: number;
	tokenId: number;
	name: string;
	metadata: string | null;
	totalQuantity: number;
}

interface OrderWithRelations extends Order {
	items: {
		product: Product;
		quantity: number;
		price: number;
	}[];
	user: User;
	seller: User;
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
					},
				},
				user: true,
				seller: {
					select: {
						name: true,
						email: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
		});
	}),

	// Get producer's sales
	getProducerOrders: protectedProcedure.query(async ({ ctx }) => {
		// Verify the user is a producer
		if (ctx.session.user.role !== "COFFEE_PRODUCER") {
			throw new Error("Unauthorized. Only producers can access their sales.");
		}

		return ctx.db.order.findMany({
			where: { sellerId: ctx.session.user.id },
			include: {
				items: {
					include: {
						product: true,
					},
				},
				user: {
					select: {
						name: true,
						email: true,
						physicalAddress: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
		});
	}),

	// Create a new order
	createOrder: protectedProcedure
		.input(
			z.object({
				cartId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }): Promise<OrderWithRelations> => {
			// Start a transaction
			return ctx.db.$transaction(
				async (tx) => {
					// Get the cart with items
					const cart = await tx.shoppingCart.findUnique({
						where: { id: input.cartId },
						include: {
							items: {
								include: {
									product: true,
								},
							},
						},
					});

					if (!cart) {
						throw new TRPCError({
							code: "NOT_FOUND",
							message: "Cart not found",
						});
					}

					if (cart.items.length === 0) {
						throw new TRPCError({
							code: "BAD_REQUEST",
							message: "Cart is empty",
						});
					}

					// Validate stock for all items and prepare stock updates
					const stockUpdates: Prisma.PrismaPromise<Product>[] = [];
					for (const item of cart.items) {
						if (item.quantity > item.product.stock) {
							throw new TRPCError({
								code: "BAD_REQUEST",
								message: `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}, Requested: ${item.quantity}`,
							});
						}

						// Prepare stock update
						stockUpdates.push(
							tx.product.update({
								where: { id: item.product.id },
								data: {
									stock: {
										decrement: item.quantity,
									},
								},
							}),
						);
					}

					// Find the seller (producer)
					const seller = await tx.user.findFirst({
						where: {
							role: "COFFEE_PRODUCER",
							walletAddress: {
								not: "",
							},
						},
					});

					if (!seller) {
						throw new TRPCError({
							code: "NOT_FOUND",
							message: "No eligible producer found for this order",
						});
					}

					// Calculate total
					const total = cart.items.reduce(
						(sum, item) => sum + item.product.price * item.quantity,
						0,
					);

					try {
						// Execute all stock updates
						await Promise.all(stockUpdates);

						// Create the order
						const order = (await tx.order.create({
							data: {
								userId: ctx.session.user.id,
								sellerId: seller.id,
								total,
								status: OrderStatus.PENDING,
								items: {
									create: cart.items.map((item) => ({
										productId: item.product.id,
										quantity: item.quantity,
										price: item.product.price,
									})),
								},
							},
							include: {
								items: {
									include: {
										product: true,
									},
								},
								user: true,
								seller: true,
							},
						})) as OrderWithRelations;

						// Clean up the cart
						await tx.shoppingCartItem.deleteMany({
							where: { shoppingCartId: cart.id },
						});

						await tx.shoppingCart.delete({
							where: { id: cart.id },
						});

						return order;
					} catch (error) {
						// If anything fails, the transaction will be rolled back automatically
						throw new TRPCError({
							code: "INTERNAL_SERVER_ERROR",
							message: "Failed to process order",
							cause: error,
						});
					}
				},
				{
					// Set a timeout and isolation level for the transaction
					timeout: 10000,
					isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
				},
			);
		}),

	// Get user's NFT collectibles
	getUserCollectibles: protectedProcedure.query(async ({ ctx }) => {
		const user = await ctx.db.user.findUnique({
			where: { id: ctx.session.user.id },
			select: { walletAddress: true },
		});

		if (!user?.walletAddress) {
			return [];
		}

		try {
			// Get NFTs from the contract
			const products = await ctx.db.product.findMany();

			// Get balances for each product
			const collectibles = await Promise.all(
				products.map(async (product) => {
					try {
						if (!ctx.session.user.email) {
							throw new Error("User email not found");
						}
						const userAuthData = await registerUser(ctx.session.user.email, "1234");
						const balance = await balanceOf(userAuthData, BigInt(product.tokenId));

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
