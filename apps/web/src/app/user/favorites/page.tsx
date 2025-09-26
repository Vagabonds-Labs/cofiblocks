"use client";

import type { JsonValue } from "@prisma/client/runtime/library";
import { ProductCard } from "@repo/ui/productCard";
import { useAtom } from "jotai";
import React from "react";
import { useTranslation } from "react-i18next";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import { useCavosAuth } from "~/providers/cavos-auth";
import { addItemAtom } from "~/store/cartAtom";
import { api } from "~/trpc/react";

interface Product {
	id: number;
	tokenId: number;
	name: string;
	price: number;
	nftMetadata: JsonValue;
	stock: number;
	createdAt: Date;
	updatedAt: Date;
}

interface FavoriteItem {
	id: string;
	userId: string;
	productId: number;
	createdAt: Date;
	updatedAt: Date;
	product: Product;
}

export default function Favorites() {
	const { t } = useTranslation();
	const [addedProduct, setAddedProduct] = React.useState<number | null>(null);
	const [, addItem] = useAtom(addItemAtom);
	const { user: cavosUser, isAuthenticated } = useCavosAuth();

	// Get favorites from the database
	const {
		data: favorites,
		refetch: refetchFavorites,
		error: favoritesError,
	} = api.favorites.getUserFavorites.useQuery(undefined, {
		retry: false,
		enabled: isAuthenticated && !!cavosUser,
	});

	console.log("Debug - User:", cavosUser);
	console.log("Debug - Favorites:", favorites);
	console.log("Debug - Favorites Error:", favoritesError);

	const { mutate: removeFromFavorites } =
		api.favorites.removeFromFavorites.useMutation({
			onSuccess: () => {
				void refetchFavorites();
			},
		});

	const handleAddToCart = (productId: number, product: Product) => {
		addItem({
			id: productId.toString(),
			tokenId: productId,
			name: product.name,
			quantity: 1,
			price: product.price,
			imageUrl: getImageUrl(product.nftMetadata),
		});
		setAddedProduct(productId);
	};

	const handleRemoveFromFavorites = (productId: number) => {
		removeFromFavorites({ productId });
	};

	const getImageUrl = (nftMetadata: JsonValue): string => {
		if (typeof nftMetadata !== "string") return "/images/default.webp";
		try {
			const metadata = JSON.parse(nftMetadata) as { imageUrl: string };
			return metadata.imageUrl.startsWith("Qm")
				? `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${metadata.imageUrl}`
				: metadata.imageUrl;
		} catch {
			return "/images/default.webp";
		}
	};

	return (
		<ProfileOptionLayout title={t("favorite_products")}>
			<div className="flex flex-col items-center gap-6 p-4 mx-auto">
				{favorites?.map((favorite: FavoriteItem) => (
					<div
						key={favorite.product.id}
						className="w-full max-w-md flex justify-center"
					>
						<ProductCard
							image={getImageUrl(favorite.product.nftMetadata)}
							region={t("region")}
							farmName={t("farm_name")}
							variety={favorite.product.name}
							price={favorite.product.price}
							badgeText={t("badge_text")}
							stock={favorite.product.stock}
							onClick={() => handleRemoveFromFavorites(favorite.product.id)}
							onAddToCart={() =>
								handleAddToCart(favorite.product.id, favorite.product)
							}
							isAddingToShoppingCart={addedProduct === favorite.product.id}
							isConnected={true}
						/>
					</div>
				))}
				{!favorites?.length && (
					<div className="text-center text-gray-500">
						{t("no_favorite_products")}
					</div>
				)}
			</div>
		</ProfileOptionLayout>
	);
}
