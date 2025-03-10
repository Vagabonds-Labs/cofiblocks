import { PrismaClient } from "@prisma/client";
import { env } from "~/env";

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
	return new PrismaClient({
		log:
			env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
	});
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") {
	globalForPrisma.prisma = db;
}

export const productService = {
	async createProduct(
		tokenId: number,
		name: string,
		price: number,
		description: string,
		image: string,
		strength: string,
	) {
		try {
			return await db.product.create({
				data: {
					name: name,
					tokenId: tokenId,
					price: price,
					nftMetadata: JSON.stringify({
						description: description,
						imageUrl: image,
						imageAlt: image,
						region: "",
						farmName: "",
						strength: strength,
					}),
				},
			});
		} catch (error) {
			console.error("Error creating product:", error);
			throw new Error("Database error occurred");
		}
	},
};
