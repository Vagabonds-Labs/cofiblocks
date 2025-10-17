import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getProductPrices } from "~/server/contracts/marketplace";
import type { PaymentToken } from "~/utils/contracts";

export const cartRouter = createTRPCRouter({
	// Get user's cart with items
	getUserCart: protectedProcedure.query(async ({ ctx }) => {
		if (!ctx.session.user) {
			throw new Error("User not authenticated");
		}
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
				is_grounded: z.boolean(),
				quantity: z.number().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Find or create user's cart
			if (!ctx.session.user) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}
			let cart = await ctx.db.shoppingCart.findFirst({
				where: { userId: ctx.session.user.id },
			});

			if (!cart) {
				cart = await ctx.db.shoppingCart.create({
					data: { userId: ctx.session.user.id },
				});
			}

			// Fetch product stocks
			const product = await ctx.db.product.findUnique({
				where: { id: input.productId },
				select: { stock: true, ground_stock: true, bean_stock: true, name: true },
			});
			if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });

			// Current quantity of this variant already in cart
			const existingVariantItems = await ctx.db.shoppingCartItem.findMany({
				where: {
					shoppingCartId: cart.id,
					productId: input.productId,
					is_grounded: input.is_grounded,
				},
				select: { quantity: true },
			});
			const alreadyInCart = existingVariantItems.reduce((s, i) => s + i.quantity, 0);
			const variantStock = input.is_grounded ? (product.ground_stock ?? 0) : (product.bean_stock ?? 0);
			const totalStockCap = Math.min(variantStock, product.stock ?? variantStock);
			if (alreadyInCart + input.quantity > totalStockCap) {
				throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient stock for requested quantity" });
			}

			// Check if item already exists in cart
			const existingItem = await ctx.db.shoppingCartItem.findFirst({
				where: {
					shoppingCartId: cart.id,
					productId: input.productId,
					is_grounded: input.is_grounded,
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
					is_grounded: input.is_grounded,
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
			const item = await ctx.db.shoppingCartItem.findUnique({
				where: { id: input.cartItemId },
				include: { product: true },
			});
			if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "Cart item not found" });
			const variantStock = item.is_grounded ? (item.product.ground_stock ?? 0) : (item.product.bean_stock ?? 0);
			const totalStockCap = Math.min(variantStock, item.product.stock ?? variantStock);
			if (input.quantity > totalStockCap) {
				throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient stock for requested quantity" });
			}
			return ctx.db.shoppingCartItem.update({
				where: { id: input.cartItemId },
				data: { quantity: input.quantity },
				include: { product: true },
			});
		}),

	// Clear cart
	clearCart: protectedProcedure.mutation(async ({ ctx }) => {
		if (!ctx.session.user) {
			throw new Error("User not authenticated");
		}
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

	getCartUnitPrices: protectedProcedure
		.input(z.object({ cartId: z.string(), paymentToken: z.enum(["STRK", "USDC", "USDT"]) }))
		.query(async ({ ctx, input }) => {
			const shopItems = await ctx.db.shoppingCartItem.findMany({
				where: { shoppingCartId: input.cartId },
				include: { product: true },
			});
			const tokenIds = shopItems.map((item) => BigInt(item.product.tokenId));
			const tokenAmounts = shopItems.map((_) => BigInt(1));
			const result: Record<string, string> = {};
			const unitPrices = await getProductPrices(tokenIds, tokenAmounts, input.paymentToken as PaymentToken);
			for (const shopItem of shopItems) {
				if (shopItem && shopItem.id) {
					const tokenId = shopItem.product.tokenId;
					result[shopItem.id] = String(unitPrices[tokenId.toString()] ?? 0);
				}
			}
			return { unitPrices: result };
		}),
});
