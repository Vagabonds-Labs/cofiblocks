import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const shoppingCartRouter = createTRPCRouter({
	addItem: publicProcedure
		.input(
			z.object({
				cartId: z.number(),
				productId: z.number(),
				quantity: z.number().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { cartId, productId, quantity } = input;

			console.log("input", input);

			const product = await ctx.db.product.findUnique({
				where: { id: productId },
			});
			if (!product) {
				throw new Error("Product not found");
			}
			return ctx.db.shoppingCartItem.create({
				data: {
					shoppingCartId: cartId,
					productId,
					quantity,
				},
			});
		}),

	getItems: publicProcedure
		.input(z.object({ cartId: z.number() }))
		.query(({ ctx, input }) => {
			return ctx.db.shoppingCartItem.findMany({
				where: { shoppingCartId: input.cartId },
				include: { product: true },
			});
		}),

	removeItem: publicProcedure
		.input(z.object({ itemId: z.number() }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db.shoppingCartItem.delete({
				where: { id: input.itemId },
			});
		}),

	createOrder: publicProcedure
		.input(
			z.object({
				userId: z.number(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { userId } = input;
			const cartItems = await ctx.db.shoppingCartItem.findMany({
				where: { shoppingCart: { userId } },
				include: { product: true },
			});
			if (cartItems.length === 0) {
				throw new Error("No items in cart to create an order.");
			}
			const total = cartItems.reduce(
				(acc, item) => acc + item.product.price * item.quantity,
				0,
			);
			const order = await ctx.db.order.create({
				data: {
					userId,
					total,
					status: "PENDING",
					items: {
						create: cartItems.map((item) => ({
							productId: item.productId,
							quantity: item.quantity,
							price: item.product.price,
						})),
					},
				},
			});
			await ctx.db.shoppingCartItem.deleteMany({
				where: {
					shoppingCartId: { in: cartItems.map((item) => item.shoppingCartId) },
				},
			});
			return order;
		}),

	getOrders: publicProcedure
		.input(
			z.object({
				userId: z.number(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { userId } = input;
			return ctx.db.order.findMany({
				where: { userId },
				include: { items: true },
			});
		}),
});
