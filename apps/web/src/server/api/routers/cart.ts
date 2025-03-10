import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const cartRouter = createTRPCRouter({
	// Get user's cart with items
	getUserCart: protectedProcedure.query(async ({ ctx }) => {
		const cart = await ctx.db.shoppingCart.findFirst({
			where: { userId: ctx.session.user.id },
			include: {
				items: {
					include: {
						product: true,
					},
				},
			},
		});

		return cart;
	}),

	// Add item to cart
	addToCart: protectedProcedure
		.input(
			z.object({
				productId: z.number(),
				quantity: z.number().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Find or create user's cart
			let cart = await ctx.db.shoppingCart.findFirst({
				where: { userId: ctx.session.user.id },
			});

			if (!cart) {
				cart = await ctx.db.shoppingCart.create({
					data: { userId: ctx.session.user.id },
				});
			}

			// Check if item already exists in cart
			const existingItem = await ctx.db.shoppingCartItem.findFirst({
				where: {
					shoppingCartId: cart.id,
					productId: input.productId,
				},
			});

			if (existingItem) {
				// Update quantity if item exists
				return ctx.db.shoppingCartItem.update({
					where: { id: existingItem.id },
					data: { quantity: existingItem.quantity + input.quantity },
					include: { product: true },
				});
			}

			// Create new cart item if it doesn't exist
			return ctx.db.shoppingCartItem.create({
				data: {
					shoppingCartId: cart.id,
					productId: input.productId,
					quantity: input.quantity,
				},
				include: { product: true },
			});
		}),

	// Remove item from cart
	removeFromCart: protectedProcedure
		.input(z.object({ cartItemId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db.shoppingCartItem.delete({
				where: { id: input.cartItemId },
			});
		}),

	// Update item quantity
	updateCartItemQuantity: protectedProcedure
		.input(
			z.object({
				cartItemId: z.string(),
				quantity: z.number().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.shoppingCartItem.update({
				where: { id: input.cartItemId },
				data: { quantity: input.quantity },
				include: { product: true },
			});
		}),

	// Clear cart
	clearCart: protectedProcedure.mutation(async ({ ctx }) => {
		const cart = await ctx.db.shoppingCart.findFirst({
			where: { userId: ctx.session.user.id },
		});

		if (cart) {
			await ctx.db.shoppingCartItem.deleteMany({
				where: { shoppingCartId: cart.id },
			});
		}

		return { success: true };
	}),
});
