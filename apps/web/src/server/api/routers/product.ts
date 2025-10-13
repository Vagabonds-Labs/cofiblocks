// TODO: Implement blockchain sync mechanism to keep database in sync with on-chain data
// This should include:
// 1. Listening to blockchain events for product updates
// 2. Syncing product availability/stock from the blockchain
// 3. Updating prices based on blockchain data
// 4. Handling blockchain transaction confirmations

import type { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { authenticateUserCavos } from "~/server/services/cavos";
import {createProduct} from "~/server/contracts/marketplace";
import { CofiBlocksContracts, CURRENT_TOKEN_ID_SELECTOR, readStorageAt } from "~/utils/contracts";

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

	createProduct: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1),
				price: z.number().min(0),
				description: z.string().min(1),
				image: z.string().optional(),
				strength: z.string().min(1),
				ground_coffee_stock: z.number().min(0),
				beans_coffee_stock: z.number().min(0),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session.user || !ctx.session.user.email) {
				throw new Error("User email not found");
			}
			if (ctx.session.user.role !== "COFFEE_PRODUCER" && ctx.session.user.role !== "COFFEE_ROASTER") {
				throw new Error("User is not a producer or roaster");
			}
			// First create the product in blockchain
			const userAuthData = await authenticateUserCavos(ctx.session.user.email, ctx.db);
			let tx = "";

			// Current token id is the id for the next product to be created
			const tokenId_raw = await readStorageAt(CofiBlocksContracts.MARKETPLACE, CURRENT_TOKEN_ID_SELECTOR);
			const tokenId = Number(tokenId_raw);

			const stock = input.ground_coffee_stock + input.beans_coffee_stock;
			console.log("Stock", stock);
			try {
				tx = await createProduct(BigInt(stock), BigInt(input.price * 10**6), userAuthData);
			} catch (error) {
				if (error instanceof Error && error.message.includes("Not producer or roaster")) {
					throw new TRPCError({ code: "BAD_REQUEST", message: "User is not a producer or roaster" });
				}
				throw new TRPCError(
					{ code: "INTERNAL_SERVER_ERROR", message: "Error creating product on marketplace" + String(error) }
				);
			}
			
			// Create the product in the database
			await db.product.create({
				data: {
					tokenId: tokenId,
					name: input.name,
					price: input.price,
					nftMetadata: JSON.stringify({
						description: input.description,
						imageUrl: input.image,
						imageAlt: input.image,
						region: "",
						farmName: "",
						strength: input.strength,
					}),
					hidden: false,
					stock: stock,
					ground_stock: input.ground_coffee_stock,
					bean_stock: input.beans_coffee_stock,
					owner: ctx.session.user.id,
					initial_stock: stock,
					creation_tx_hash: tx,
				},
			});
			return { success: true };
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


		getProductFarmInfo: publicProcedure
			.input(z.object({ productId: z.number() }))
			.query(async ({ input }) => {
				const product = await db.product.findUnique({
					where: { id: input.productId },
				});

				if (!product) {
					throw new TRPCError({ code: "BAD_REQUEST", message: "Product not found" });
				}
				const farm = await db.farm.findFirst({
					where: { userId: product.owner ?? '' },
				});

				const owner_sales = await db.orderItem.findMany({
					where: { sellerId: product.owner ?? '' },
				});

				if (!farm) {
					throw new TRPCError({ code: "BAD_REQUEST", message: "Farm not found" });
				}

				return { farm, owner_sales };
			}),
});
