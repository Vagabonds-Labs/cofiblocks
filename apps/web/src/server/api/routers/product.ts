import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { mockedProducts } from "./mockProducts";

// TODO: Replace mockedProducts with real data fetched from the blockchain in the near future.
const normalizeText = (text: string): string => {
	return text
		.toLowerCase()
		.normalize("NFD")
		.replace(/[^\w\s]/g, "");
};

export const productRouter = createTRPCRouter({
	getProducts: publicProcedure
		.input(
			z.object({
				limit: z.number().min(1),
				cursor: z.number().optional(),
			}),
		)
		.query(({ input }) => {
			const { limit, cursor } = input;

			let startIndex = 0;
			if (cursor) {
				const index = mockedProducts.findIndex(
					(product) => product.id === cursor,
				);
				startIndex = index >= 0 ? index + 1 : 0;
			}

			const products = mockedProducts.slice(startIndex, startIndex + limit);
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

			const normalizedSearchTerm = normalizeText(region);

			const productsFound = mockedProducts.filter((product) => {
				const normalizedRegion = normalizeText(product.region);
				const normalizedName = normalizeText(product.name);
				const normalizedFarmName = normalizeText(product.farmName);

				return (
					normalizedRegion.includes(normalizedSearchTerm) ||
					normalizedName.includes(normalizedSearchTerm) ||
					normalizedFarmName.includes(normalizedSearchTerm)
				);
			});

			return {
				productsFound,
			};
		}),

	filterProducts: publicProcedure
		.input(
			z.object({
				strength: z.string().optional(),
				region: z.string().optional(),
				orderBy: z.string().optional(),
			}),
		)
		.query(({ input }) => {
			const { strength, region, orderBy } = input;
			let filteredProducts = [...mockedProducts];

			if (strength) {
				const normalizedStrength = normalizeText(strength);
				filteredProducts = filteredProducts.filter(
					(product) => normalizeText(product.strength) === normalizedStrength,
				);
			}

			if (region) {
				const normalizedRegion = normalizeText(region);
				filteredProducts = filteredProducts.filter(
					(product) => normalizeText(product.region) === normalizedRegion,
				);
			}

			if (orderBy) {
				filteredProducts.sort((a, b) => {
					if (orderBy === "Highest price") {
						return b.price - a.price;
					}
					return a.price - b.price;
				});
			}

			return {
				productsFound: filteredProducts,
			};
		}),
});
