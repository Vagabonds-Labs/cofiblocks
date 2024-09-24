import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const productRouter = createTRPCRouter({
	getProducts: publicProcedure
		.input(
			z.object({
				limit: z.number().min(1),
				cursor: z.number().optional(), // Pagination cursor
			}),
		)
		.query(async ({ ctx, input }) => {
			const { limit, cursor } = input;

			const products = await ctx.db.product.findMany({
				take: limit, // Fetch specified limit
				skip: cursor ? 1 : 0, // Skip current cursor
				cursor: cursor ? { id: cursor } : undefined,
				orderBy: { id: "asc" }, // Ascending order by id
			});

			const nextCursor =
				products.length === limit ? products[products.length - 1]?.id : null;

			return {
				products,
				nextCursor,
			};
		}),
});
