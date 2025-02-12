import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

interface ProductMetadata {
	description: string;
	imageUrl?: string;
	imageAlt?: string;
	region?: string;
	farmName?: string;
	strength?: string;
}

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
				image: z.string().optional(),
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

	searchProductCatalog: publicProcedure
		.input(
			z.object({
				region: z.string(),
			}),
		)
		.query(async ({ input }) => {
			const { region } = input;
			const normalizedSearchTerm = normalizeText(region);

			const products = await db.product.findMany();
			const productsFound = products.filter((product) => {
				let metadata: ProductMetadata;
				try {
					metadata = JSON.parse(
						product.nftMetadata as string,
					) as ProductMetadata;
				} catch {
					return false;
				}

				const normalizedRegion = normalizeText(metadata.region ?? "");
				const normalizedName = normalizeText(product.name);
				const normalizedFarmName = normalizeText(metadata.farmName ?? "");

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
		.query(async ({ input }) => {
			const { strength, region, orderBy } = input;
			const products = await db.product.findMany();

			const filteredProducts = products.filter((product) => {
				let metadata: ProductMetadata;
				try {
					metadata = JSON.parse(
						product.nftMetadata as string,
					) as ProductMetadata;
				} catch {
					return false;
				}

				if (strength) {
					const normalizedStrength = normalizeText(strength);
					const productStrength = normalizeText(metadata.strength ?? "");
					if (productStrength !== normalizedStrength) {
						return false;
					}
				}

				if (region) {
					const normalizedRegion = normalizeText(region);
					const productRegion = normalizeText(metadata.region ?? "");
					if (productRegion !== normalizedRegion) {
						return false;
					}
				}

				return true;
			});

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
