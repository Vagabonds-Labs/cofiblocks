import type { Prisma } from "@prisma/client";

export type NftMetadata = {
	imageUrl: string;
	imageAlt: string;
	description: string;
};

export type Product = {
	id: number;
	name: string;
	price: number;
	nftMetadata: Prisma.JsonValue | NftMetadata;
	region: string;
	farmName: string;
	strength: string;
	process?: string;
	createdAt: Date;
	updatedAt: Date;
};
