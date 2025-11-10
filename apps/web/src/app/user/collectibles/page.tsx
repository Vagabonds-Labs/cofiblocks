"use client";

import NFTCard from "@repo/ui/nftCard";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import { api } from "~/trpc/react";

interface NFTMetadata {
	name: string;
	description: string;
	image: string;
	external_url: string;
	attributes: {
		trait_type: string;
		value: string | number;
		display_type?: string;
	}[];
}

interface CollectibleDisplay {
	id: number;
	tokenId: number;
	name: string;
	metadata: NFTMetadata;
	totalQuantity: number;
}

export default function Collectibles() {
	const { t } = useTranslation();
	const [collectibles, setCollectibles] = useState<CollectibleDisplay[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const productsQuery = api.order.getUserCollectibles.useQuery();

	useEffect(() => {
		async function fetchCollectibles() {
			if (!productsQuery.data) {
				setIsLoading(false);
				return;
			}

			try {
				const products = productsQuery.data;

				const userCollectibles: CollectibleDisplay[] = [];

				// Check balance for each product
				for (const product of products) {
					try {

						const metadataResponse = await fetch(
							`/api/metadata/${product.tokenId}`,
						);
						const metadata = (await metadataResponse.json()) as NFTMetadata;

						userCollectibles.push({
							id: product.id,
							tokenId: product.tokenId,
							name: metadata.name,
							metadata,
							totalQuantity: 1,
						});

					} catch (error) {
						console.error(
							"Error fetching balance for token",
							product.tokenId,
							":",
							error,
						);
					}
				}

				console.log("Final collectibles:", userCollectibles);
				setCollectibles(userCollectibles);
			} catch (error) {
				console.error("Error fetching collectibles:", error);
			} finally {
				setIsLoading(false);
			}
		}

		void fetchCollectibles();
	}, [productsQuery.data]);

	if (isLoading || productsQuery.isLoading) {
		return (
			<ProfileOptionLayout title={t("my_collectibles")}>
				<div className="flex flex-col items-center justify-center py-12">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
					<p className="text-gray-600">{t("loading_collectibles")}</p>
				</div>
			</ProfileOptionLayout>
		);
	}

	return (
		<ProfileOptionLayout title={t("my_collectibles")}>
			<div className="space-y-6">
				{collectibles.length === 0 ? (
					<div className="text-center py-8">
						<p className="text-gray-600">{t("no_collectibles_found")}</p>
						<p className="text-sm text-gray-500 mt-2">
							Make sure you have purchased some coffee NFTs
						</p>
					</div>
				) : (
					collectibles.map((collectible) => {
						// Format the image URL to include the IPFS gateway if it's an IPFS hash
						const getImageUrl = (imageUrl?: string) => {
							if (!imageUrl || imageUrl === "/images/cafe1.webp") {
								// Only use fallback if imageUrl is missing or already the fallback
								return imageUrl ?? "/images/cafe1.webp";
							}
							
							const IPFS_GATEWAY_URL = "https://gateway.pinata.cloud/ipfs/";
							
							// If it's already a full URL (http/https), use it as-is
							if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
								return imageUrl;
							}
							
							// If it's a relative path (starts with /), use it as-is
							if (imageUrl.startsWith("/")) {
								return imageUrl;
							}
							
							// If it's an IPFS URL (ipfs://), extract hash and construct gateway URL
							if (imageUrl.startsWith("ipfs://")) {
								const hash = imageUrl.replace("ipfs://", "").trim();
								return `${IPFS_GATEWAY_URL}${hash}`;
							}
							
							// Check if it's an IPFS hash (CIDv0 starts with Qm, CIDv1 can start with bafy, bafkrei, etc.)
							// IPFS hashes are typically base58 encoded and don't contain slashes or special URL characters
							// They're usually 46 characters for CIDv0 or start with specific prefixes for CIDv1
							const isIpfsHash = /^[Qmb][A-Za-z0-9]{44,}$/.test(imageUrl) || 
												imageUrl.startsWith("bafy") || 
												imageUrl.startsWith("bafkrei") ||
												imageUrl.startsWith("bafkre") ||
												imageUrl.startsWith("Qm");
							
							if (isIpfsHash) {
								return `${IPFS_GATEWAY_URL}${imageUrl}`;
							}
							
							// If we can't determine the format, try using it as-is (might be a valid path we don't recognize)
							// Only fall back to default if it's clearly invalid
							return imageUrl;
						};

						const imageUrl = getImageUrl(collectible.metadata.image);

						return (
							<NFTCard
								key={collectible.id}
								title={collectible.name}
								nftMetadata={{
									imageSrc: imageUrl,
								}}
								quantity={collectible.totalQuantity}
								onDetailsClick={() =>
									window.open(`/product/${collectible.id}`, "_self")
								}
							/>
						);
					})
				)}
			</div>
		</ProfileOptionLayout>
	);
}
