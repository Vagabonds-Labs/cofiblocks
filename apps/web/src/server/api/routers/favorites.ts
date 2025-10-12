import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const favoritesRouter = createTRPCRouter({
	// Get user's favorites
	getUserFavorites: protectedProcedure.query(async ({ ctx }) => {
		if (!ctx.session.user) {
			throw new Error("User not authenticated");
		}
		try {
			return await ctx.db.favorite.findMany({
				where: { userId: ctx.session.user.id },
				include: {
					product: true,
				},
			});
		} catch (error) {
			console.error("Error getting favorites:", error);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to get favorites",
			});
		}
	}),

	// Add to favorites
	addToFavorites: protectedProcedure
		.input(z.object({ productId: z.number() }))
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session.user) {
				throw new Error("User not authenticated");
			}
			try {
				// First check if the product exists
				const product = await ctx.db.product.findUnique({
					where: { id: input.productId },
				});

				if (!product) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Product not found",
					});
				}

				// Then try to create the favorite
				return await ctx.db.favorite.create({
					data: {
						userId: ctx.session.user.id,
						productId: input.productId,
					},
					include: {
						product: true,
					},
				});
			} catch (error) {
				console.error("Error adding to favorites:", error);
				if (error instanceof TRPCError) throw error;
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to add to favorites",
				});
			}
		}),

	// Remove from favorites
	removeFromFavorites: protectedProcedure
		.input(z.object({ productId: z.number() }))
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session.user) {
				throw new Error("User not authenticated");
			}
			try {
				return await ctx.db.favorite.delete({
					where: {
						userId_productId: {
							userId: ctx.session.user.id,
							productId: input.productId,
						},
					},
				});
			} catch (error) {
				console.error("Error removing from favorites:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to remove from favorites",
				});
			}
		}),

	// Check if product is favorited
	isProductFavorited: protectedProcedure
		.input(z.object({ productId: z.number() }))
		.query(async ({ ctx, input }) => {
			if (!ctx.session.user) {
				throw new Error("User not authenticated");
			}
			try {
				const favorite = await ctx.db.favorite.findUnique({
					where: {
						userId_productId: {
							userId: ctx.session.user.id,
							productId: input.productId,
						},
					},
				});
				return !!favorite;
			} catch (error) {
				console.error("Error checking favorite status:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to check favorite status",
				});
			}
		}),
});
