import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
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
		.query(async ({ input }) => {
			const { limit, cursor } = input;

			// Fetch products from the database using Prisma
			const products = await db.product.findMany({
				take: limit, // Limit the number of products
				skip: cursor ? 1 : 0, // Skip if cursor is provided
				cursor: cursor ? { id: cursor } : undefined, // Cursor-based pagination
				orderBy: { id: "asc" }, // Order products by ID ascending
			});

			// Determine next cursor for pagination
			const nextCursor =
				products.length === limit ? products[products.length - 1]?.id : null;

			return {
				products: products,
				nextCursor,
			};
		}),

	getProductById: publicProcedure
		.input(
			z.object({
				id: z.number().min(1),
			}),
		)
		.query(async ({ input }) => {
			try {
				const product = await db.product.findUnique({
					where: { id: input.id },
				});

				if (!product) {
					throw new Error("Product not found");
				}

				return product;
			} catch (error) {
				console.error("Error fetching product:", error);
				throw new Error("Failed to fetch product");
			}
		}),

	createProduct: publicProcedure
		.input(
			z.object({
				tokenId: z.number(),
				name: z.string().min(1),
				price: z.number().min(0),
				description: z.string().min(1),
				image: z
					.string()
					.optional()
					.refine(
						(val) => val === "" || z.string().url().safeParse(val).success,
						{ message: "Invalid URL" },
					),
				strength: z.string().min(1),
				region: z.string().optional(),
				farmName: z.string().optional(),
			}),
		)
		.mutation(async ({ input }) => {
			try {
				const newProduct = await db.product.create({
					data: {
						tokenId: input.tokenId,
						name: input.name,
						price: input.price,
						nftMetadata: JSON.stringify({
							description: input.description,
							imageUrl: input.image,
							imageAlt: input.image,
							region: input.region ?? "",
							farmName: input.farmName ?? "",
							strength: input.strength,
						}),
					},
				});
				return { success: true, product: newProduct };
			} catch (error) {
				console.error("Error creating product:", error);
				throw new Error("Failed to create product");
			}
		}),

	// updateProductStock: publicProcedure
	// 	.input(
	// 		z.object({
	// 			id: z.number().min(1),
	// 			buy_amount: z.number().min(0),
	// 		}),
	// 	)
	// 	.mutation(async ({ input }) => {
	// 		try {
	// 			const updatedProduct = await db.product.update({
	// 				where: { id: input.id },
	// 				data: {
	// 					orderItems: {order}
	// 				},
	// 			});

	// 			return { success: true, product: updatedProduct };
	// 		} catch (error) {
	// 			console.error("Error updating product stock:", error);
	// 			throw new Error("Failed to update product stock");
	// 		}
	// 	}),

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
