import {
	type Order,
	OrderStatus,
	type Product,
	type User,
} from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { serverContracts } from "~/services/serverContracts";

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
		return ctx.db.order.findMany({
			where: { userId: ctx.session.user.id },
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
			return ctx.db.$transaction(async (tx) => {
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
					throw new Error("Cart not found");
				}

				// Find the seller (producer) based on the first product's tokenId
				const firstProduct = cart.items[0]?.product;
				if (!firstProduct) {
					throw new Error("No products in cart");
				}

				// Find the producer who owns this product
				const seller = await tx.user.findFirst({
					where: {
						role: "COFFEE_PRODUCER",
						walletAddress: {
							not: "",
						},
					},
				});

				if (!seller) {
					throw new Error(`No producer found for product ${firstProduct.name}`);
				}

				// Calculate total
				const total = cart.items.reduce(
					(sum, item) => sum + item.product.price * item.quantity,
					0,
				);

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

				return order;
			});
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
						const balance = await serverContracts.getBalance(
							user.walletAddress,
							product.tokenId.toString(),
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
