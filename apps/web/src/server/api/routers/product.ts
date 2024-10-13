import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { mockedProducts } from "./mockProducts";

// TODO: Replace mockedProducts with real data fetched from the blockchain in the near future.

export const productRouter = createTRPCRouter({
	getProducts: publicProcedure
		.input(
			z.object({
				limit: z.number().min(1),
				cursor: z.number().optional(), // Pagination cursor
			}),
		)
		.query(({ input }) => {
			const { limit, cursor } = input;

			// Find the starting index based on the cursor
			let startIndex = 0;
			if (cursor) {
				const index = mockedProducts.findIndex(
					(product) => product.id === cursor,
				);
				startIndex = index >= 0 ? index + 1 : 0;
			}

			// Get the slice of products for the current page
			const products = mockedProducts.slice(startIndex, startIndex + limit);

			// Determine the next cursor
			const nextCursor =
				products.length === limit ? products[products.length - 1]?.id : null;

			return {
				products,
				nextCursor,
			};
		}),

	searchProductCatalog: publicProcedure
		.input(
			z.object({
				region: z.string(),
			}),
		)
		.query(({ input }) => {
			const { region } = input;

			const productsFound = mockedProducts.filter(
				(product) => product.region === region,
			);

			return {
				productsFound,
			};
		}),
});
