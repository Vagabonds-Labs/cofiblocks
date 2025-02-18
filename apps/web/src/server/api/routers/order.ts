import { OrderStatus } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const orderRouter = createTRPCRouter({
	// Create a new order
	createOrder: protectedProcedure
		.input(
			z.object({
				cartId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
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

				// Calculate total
				const total = cart.items.reduce(
					(sum, item) => sum + item.product.price * item.quantity,
					0,
				);

				// Create the order
				const order = await tx.order.create({
					data: {
						userId: ctx.session.user.id,
						total,
						status: OrderStatus.COMPLETED,
						items: {
							create: cart.items.map((item) => ({
								productId: item.product.id,
								quantity: item.quantity,
								price: item.product.price,
							})),
						},
					},
					include: {
						items: true,
					},
				});

				// Clear the cart
				await tx.shoppingCartItem.deleteMany({
					where: { shoppingCartId: cart.id },
				});

				return order;
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
			},
			orderBy: { createdAt: "desc" },
		});
	}),

	// Get a specific order
	getOrder: protectedProcedure
		.input(z.object({ orderId: z.string() }))
		.query(async ({ ctx, input }) => {
			const order = await ctx.db.order.findUnique({
				where: { id: input.orderId },
				include: {
					items: {
						include: {
							product: true,
						},
					},
				},
			});

			if (!order || order.userId !== ctx.session.user.id) {
				throw new Error("Order not found");
			}

			return order;
		}),
});
