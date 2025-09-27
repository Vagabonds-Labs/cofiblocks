"use client";

import NFTCard from "@repo/ui/nftCard";
import { useAccount } from "@starknet-react/core";
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
	const { address, status } = useAccount();
	const [collectibles, setCollectibles] = useState<CollectibleDisplay[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const productsQuery = api.product.getProducts.useQuery(
		{ limit: 100, cursor: undefined },
		{ enabled: !!address },
	);

	useEffect(() => {
		async function fetchCollectibles() {
			if (!productsQuery.data) {
				setIsLoading(false);
				return;
			}

			try {
				const products = productsQuery.data.products;
				console.log("Found products:", products.length);

				const userCollectibles: CollectibleDisplay[] = [];

				// Check balance for each product
				for (const product of products) {
					try {
						console.log("Checking balance for token", product.tokenId);

						const balance = await api.cofiCollection.getBalanceOf.useQuery({
							tokenId: product.tokenId.toString(),
						});
						const balanceNumber = Number(balance);

						console.log(
							"Balance result for token",
							product.tokenId,
							":",
							balance,
						);
						console.log("Parsed balance:", balanceNumber);

						if (balanceNumber > 0) {
							console.log("Fetching metadata for token", product.tokenId);
							const metadataResponse = await fetch(
								`/api/metadata/${product.tokenId}`,
							);
							const metadata = (await metadataResponse.json()) as NFTMetadata;
							console.log("Got metadata:", metadata);

							userCollectibles.push({
								id: product.id,
								tokenId: product.tokenId,
								name: metadata.name,
								metadata,
								totalQuantity: balanceNumber,
							});
						}
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

	if (!address || status === "disconnected") {
		return (
			<ProfileOptionLayout title={t("my_collectibles")}>
				<div className="text-center py-8">
					<p className="text-gray-600 mb-4">
						{t("connect_wallet_to_view_collectibles")}
					</p>
					<p className="text-sm text-gray-500">Current status: {status}</p>
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
						const imageUrl = collectible.metadata.image
							? collectible.metadata.image.startsWith("Qm")
								? `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${collectible.metadata.image}`
								: collectible.metadata.image
							: "/images/cafe1.webp";

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
