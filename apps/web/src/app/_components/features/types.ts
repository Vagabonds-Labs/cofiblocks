import type { Prisma } from "@prisma/client";

export type NftMetadata = {
	imageUrl: string;
	imageAlt: string;
	description: string;
	strength: string;
	farmName: string;
	region: string;
};

export type Product = {
	id: number;
	tokenId: number;
	name: string;
	price: number;
	nftMetadata: Prisma.JsonValue | NftMetadata;
	process?: string;
	createdAt: Date;
	updatedAt: Date;
};
