import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const shoppingCartRouter = createTRPCRouter({
	addItem: publicProcedure
		.input(
			z.object({
				cartId: z.string(),
				productId: z.number(),
				quantity: z.number(),
			}),
		)
		.mutation(async ({ input }) => {
			// TODO: Implement actual cart logic
			return { success: true };
		}),

	removeItem: publicProcedure
		.input(z.object({ itemId: z.string() }))
		.mutation(async ({ input }) => {
			// TODO: Implement actual remove logic
			return { success: true };
		}),

	getItems: publicProcedure
		.input(z.object({ cartId: z.string() }))
		.query(async ({ input }) => {
			return { items: [] };
		}),
});
