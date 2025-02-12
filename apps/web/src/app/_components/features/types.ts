import type { Prisma } from "@prisma/client";
import type { JsonValue } from "@prisma/client/runtime/library";

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

export interface SearchResult {
	id: number;
	tokenId: number;
	name: string;
	price: number;
	nftMetadata: JsonValue;
	createdAt: Date;
	updatedAt: Date;
	region: string;
	strength: string;
}
