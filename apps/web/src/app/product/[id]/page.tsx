"use client";

import Skeleton from "@repo/ui/skeleton";
import { useAccount, useDisconnect } from "@starknet-react/core";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ProductDetails from "~/app/_components/features/ProductDetails";
import { ProfileOptions } from "~/app/_components/features/ProfileOptions";
import WalletConnect from "~/app/_components/features/WalletConnect";
import type { NftMetadata } from "~/app/_components/features/types";
import Header from "~/app/_components/layout/Header";
import Main from "~/app/_components/layout/Main";
import {
	useCofiCollectionContract,
	useMarketplaceContract,
} from "~/services/contractsInterface";
import { api } from "~/trpc/react";

interface ParsedMetadata extends NftMetadata {
	imageUrl: string;
	region: string;
	farmName: string;
	strength: string;
	description: string;
}

interface RawMetadata {
	imageUrl?: unknown;
	imageAlt?: unknown;
	region?: unknown;
	farmName?: unknown;
	strength?: unknown;
	description?: unknown;
}

export default function ProductPage() {
	const { t } = useTranslation();
	const { data: session } = useSession();
	const { address } = useAccount();
	const { disconnect } = useDisconnect();
	const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
	const [bagsAvailable, setBagsAvailable] = useState<number | null>(null);
	const marketplaceContract = useMarketplaceContract();
	const params = useParams();
	const idParam = params?.id;
	const id =
		typeof idParam === "string"
			? idParam
			: Array.isArray(idParam)
				? idParam[0]
				: "0";
	const productId = id ? Number.parseInt(id, 10) : 0;

	const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

	const { data: isFavorited, refetch: refetchFavorited } =
		api.favorites.isProductFavorited.useQuery(
			{ productId },
			{
				enabled: !!productId && !!address && !!session,
				retry: false,
			},
		);

	const { mutate: addToFavorites } = api.favorites.addToFavorites.useMutation({
		onSuccess: () => {
			toast.success(t("added_to_favorites"));
			void refetchFavorited();
			setIsTogglingFavorite(false);
		},
		onError: (error) => {
			console.error("Error adding to favorites:", error);
			toast.error(t("error_adding_to_favorites"));
			setIsTogglingFavorite(false);
		},
	});

	const { mutate: removeFromFavorites } =
		api.favorites.removeFromFavorites.useMutation({
			onSuccess: () => {
				toast.success(t("removed_from_favorites"));
				void refetchFavorited();
				setIsTogglingFavorite(false);
			},
			onError: (error) => {
				console.error("Error removing from favorites:", error);
				toast.error(t("error_removing_from_favorites"));
				setIsTogglingFavorite(false);
			},
		});

	const handleToggleFavorite = () => {
		if (!product || !session) {
			toast.error(t("please_connect_to_favorite"));
			return;
		}

		try {
			setIsTogglingFavorite(true);
			if (isFavorited) {
				removeFromFavorites({ productId });
			} else {
				addToFavorites({ productId });
			}
		} catch (error) {
			console.error("Error toggling favorite:", error);
			toast.error(t("error_updating_favorites"));
			setIsTogglingFavorite(false);
		}
	};

	const { data: product, isLoading: isLoadingProduct } =
		api.product.getProductById.useQuery(
			{ id: productId },
			{
				enabled: !!productId,
				retry: false,
			},
		);

	useEffect(() => {
		async function getStock() {
			if (!marketplaceContract || !product?.tokenId) return;
			try {
				const stock = await marketplaceContract.call("listed_product_stock", [
					product.tokenId,
					"0x0",
				]);
				setBagsAvailable(Number(stock));
			} catch (error) {
				console.error("Error getting stock:", error);
				setBagsAvailable(null);
			}
		}
		void getStock();
	}, [marketplaceContract, product?.tokenId]);

	const handleConnect = () => {
		setIsWalletModalOpen(true);
	};

	const handleCloseWalletModal = () => {
		setIsWalletModalOpen(false);
	};

	const parseMetadata = (metadata: string | null): ParsedMetadata => {
		try {
			let parsed: RawMetadata = {};
			try {
				// Use type assertion for the initial parse result
				const rawResult = JSON.parse(metadata ?? "{}") as unknown;
				// Type guard to ensure we have an object
				if (
					rawResult &&
					typeof rawResult === "object" &&
					!Array.isArray(rawResult)
				) {
					const result = rawResult as Record<string, unknown>;
					parsed = {
						imageUrl: result.imageUrl,
						imageAlt: result.imageAlt,
						region: result.region,
						farmName: result.farmName,
						strength: result.strength,
						description: result.description,
					};
				}
			} catch {
				// If JSON parsing fails, use empty object
			}

			return {
				imageUrl: typeof parsed.imageUrl === "string" ? parsed.imageUrl : "",
				imageAlt: typeof parsed.imageAlt === "string" ? parsed.imageAlt : "",
				region: typeof parsed.region === "string" ? parsed.region : "",
				farmName: typeof parsed.farmName === "string" ? parsed.farmName : "",
				strength:
					typeof parsed.strength === "string" ? parsed.strength : "Medium",
				description:
					typeof parsed.description === "string" ? parsed.description : "",
			};
		} catch {
			return {
				imageUrl: "",
				imageAlt: "",
				region: "",
				farmName: "",
				strength: "Medium",
				description: "",
			};
		}
	};

	return (
		<Main>
			<div className="flex flex-col min-h-screen">
				<Header
					address={address}
					disconnect={disconnect}
					showCart={true}
					onConnect={handleConnect}
					profileOptions={
						address ? <ProfileOptions address={address} /> : undefined
					}
				/>
				<div className="flex-grow px-4 md:px-6 lg:px-8 pt-24">
					{isLoadingProduct ? (
						<div className="space-y-4">
							<Skeleton className="h-96 w-full" />
							<div className="space-y-2">
								<Skeleton className="h-8 w-48" />
								<Skeleton className="h-6 w-32" />
								<Skeleton className="h-24 w-full" />
							</div>
						</div>
					) : product ? (
						<ProductDetails
							product={{
								id: product.id,
								tokenId: product.tokenId,
								image:
									parseMetadata(product.nftMetadata as string).imageUrl ||
									"/images/cafe1.webp",
								name: product.name,
								region: parseMetadata(product.nftMetadata as string).region,
								farmName: parseMetadata(product.nftMetadata as string).farmName,
								roastLevel: parseMetadata(product.nftMetadata as string)
									.strength,
								bagsAvailable,
								price: product.price,
								type: "Buyer",
								process: "Natural",
								description: parseMetadata(product.nftMetadata as string)
									.description,
								stock: product.stock ?? 0,
							}}
							isConnected={!!address}
							onConnect={handleConnect}
							isFavorited={isFavorited}
							onToggleFavorite={handleToggleFavorite}
							isLoadingFavorite={isTogglingFavorite}
						/>
					) : (
						<div className="text-center py-8">
							<p className="text-gray-600">Product not found</p>
						</div>
					)}
				</div>

				<WalletConnect
					isOpen={isWalletModalOpen}
					onClose={handleCloseWalletModal}
					onSuccess={handleCloseWalletModal}
				/>
			</div>
		</Main>
	);
}
