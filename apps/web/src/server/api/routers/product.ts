// TODO: Implement blockchain sync mechanism to keep database in sync with on-chain data
// This should include:
// 1. Listening to blockchain events for product updates
// 2. Syncing product availability/stock from the blockchain
// 3. Updating prices based on blockchain data
// 4. Handling blockchain transaction confirmations

import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

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
				includeHidden: z.boolean().optional().default(false),
			}),
		)
		.query(async ({ input }) => {
			const { limit, cursor, includeHidden } = input;

			const products = await db.product.findMany({
				take: limit,
				skip: cursor ? 1 : 0,
				cursor: cursor ? { id: cursor } : undefined,
				orderBy: { id: "asc" },
				where: includeHidden
					? undefined
					: {
							NOT: {
								hidden: true,
							},
						},
			});

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
				image: z.string().optional(),
				strength: z.string().min(1),
				region: z.string().optional(),
				farmName: z.string().optional(),
				stock: z.number().min(0),
			}),
		)
		.mutation(async ({ input }) => {
			try {
				const newProduct = await db.product.create({
					data: {
						tokenId: input.tokenId,
						name: input.name,
						price: input.price,
						stock: input.stock,
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
		.query(async ({ input }) => {
			const { region } = input;
			const normalizedSearchTerm = normalizeText(region);

			const products = await db.product.findMany({
				where: {
					OR: [
						{
							nftMetadata: {
								path: ["$.region"],
								string_contains: normalizedSearchTerm,
							},
						},
						{
							name: {
								contains: normalizedSearchTerm,
							},
						},
						{
							nftMetadata: {
								path: ["$.farmName"],
								string_contains: normalizedSearchTerm,
							},
						},
					],
				},
			});

			return {
				productsFound: products,
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
		.query(async ({ input }) => {
			const { strength, region, orderBy } = input;

			const conditions: Prisma.ProductWhereInput[] = [];

			if (strength) {
				const normalizedStrength = normalizeText(strength);
				conditions.push({
					nftMetadata: {
						path: ["$.strength"],
						string_contains: normalizedStrength,
					},
				});
			}

			if (region) {
				const normalizedRegion = normalizeText(region);
				conditions.push({
					nftMetadata: {
						path: ["$.region"],
						string_contains: normalizedRegion,
					},
				});
			}

			const products = await db.product.findMany({
				where: conditions.length > 0 ? { AND: conditions } : undefined,
				orderBy: orderBy
					? {
							price: orderBy === "Highest price" ? "desc" : "asc",
						}
					: undefined,
			});

			return {
				productsFound: products,
			};
		}),
});
