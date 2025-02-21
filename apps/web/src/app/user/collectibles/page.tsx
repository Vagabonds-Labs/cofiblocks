"use client";

import NFTCard from "@repo/ui/nftCard";
import { useTranslation } from "react-i18next";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import { api } from "~/trpc/react";

interface NFTMetadata {
	imageSrc: string;
	description?: string;
}

interface RawNFTMetadata {
	imageUrl: string;
	description: string;
	// Add other potential fields from your metadata
	region?: string;
	farmName?: string;
	strength?: string;
}

interface CollectibleDisplay {
	id: number;
	tokenId: number;
	name: string;
	metadata: NFTMetadata;
	totalQuantity: number;
}

function parseNFTMetadata(jsonString: string): NFTMetadata {
	try {
		const parsed = JSON.parse(jsonString) as unknown;

		if (!parsed || typeof parsed !== "object") {
			throw new Error("Invalid metadata format");
		}

		const metadata = parsed as Record<string, unknown>;

		if (typeof metadata.imageUrl !== "string") {
			throw new Error("Invalid imageUrl in metadata");
		}

		return {
			imageSrc: metadata.imageUrl,
			description:
				typeof metadata.description === "string"
					? metadata.description
					: undefined,
		};
	} catch (error) {
		console.error("Error parsing NFT metadata:", error);
		return {
			imageSrc: "/images/cafe1.webp", // Default fallback image
		};
	}
}

export default function Collectibles() {
	const { t } = useTranslation();
	const { data: rawCollectibles, isLoading } =
		api.order.getUserCollectibles.useQuery();

	// Parse metadata for each collectible
	const collectibles: CollectibleDisplay[] | undefined = rawCollectibles?.map(
		(collectible) => {
			const metadata =
				typeof collectible.metadata === "string"
					? parseNFTMetadata(collectible.metadata)
					: { imageSrc: "/images/cafe1.webp" };

			return {
				id: collectible.id,
				tokenId: collectible.tokenId,
				name: collectible.name,
				metadata,
				totalQuantity: collectible.totalQuantity,
			};
		},
	);

	if (isLoading) {
		return (
			<ProfileOptionLayout title={t("my_collectibles")}>
				<div className="space-y-6">
					{[1, 2, 3].map((i) => (
						<div key={i} className="animate-pulse">
							<div className="h-64 bg-gray-200 rounded-lg" />
						</div>
					))}
				</div>
			</ProfileOptionLayout>
		);
	}

	return (
		<ProfileOptionLayout title={t("my_collectibles")}>
			<div className="space-y-6">
				{collectibles?.length === 0 ? (
					<div className="text-center py-8">
						<p className="text-gray-600">{t("no_collectibles_found")}</p>
					</div>
				) : (
					collectibles?.map((collectible) => (
						<NFTCard
							key={collectible.id}
							title={collectible.name}
							nftMetadata={collectible.metadata}
							quantity={collectible.totalQuantity}
						/>
					))
				)}
			</div>
		</ProfileOptionLayout>
	);
}
