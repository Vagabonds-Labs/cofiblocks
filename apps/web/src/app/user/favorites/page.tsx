"use client";

import type { JsonValue } from "@prisma/client/runtime/library";
import { ProductCard } from "@repo/ui/productCard";
// import { useAtom } from "jotai";
import { useSession } from "next-auth/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
// import { addItemAtom } from "~/store/cartAtom";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

interface Product {
	id: number;
	tokenId: number;
	ground_stock: number;
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
	const router = useRouter();
	const [addedProduct, setAddedProduct] = React.useState<number | null>(null);
	// const [, _addItem] = useAtom(addItemAtom);
	const { data: session } = useSession();
	const isAuthenticated = session?.user !== undefined;
	const { refetch: refetchCart } = api.cart.getUserCart.useQuery();
	const { mutate: addToCart } = api.cart.addToCart.useMutation({
		onSuccess: () => {
			void refetchCart();
		},
	});

	// Get favorites from the database
	const {
		data: favorites,
		// refetch: _refetchFavorites,
		// error: _favoritesError,
	} = api.favorites.getUserFavorites.useQuery(undefined, {
		retry: false,
		enabled: isAuthenticated,
	});

	const handleAddToCart = (productId: number, product: Product) => {
		setAddedProduct(productId);
		addToCart(
			{
				productId: product.id,
				quantity: 1,
				is_grounded: product.ground_stock > 0 ? true : false,
			},
			{
				onSuccess: () => {
					setAddedProduct(null);
				},
				onError: () => {
					setAddedProduct(null);
				},
			},
		);
	};

	const handleProductClick = (productId: number) => {
		router.push(`/product/${productId}`);
	};

	const getImageUrl = (nftMetadata: JsonValue): string => {
		if (typeof nftMetadata !== "string") return "/images/cafe1.webp";
		try {
			const metadata = JSON.parse(nftMetadata) as { imageUrl: string };
			const imageUrl = metadata.imageUrl;
			const IPFS_GATEWAY_URL = "https://gateway.pinata.cloud/ipfs/";
			
			if (!imageUrl) return "/images/cafe1.webp";
			
			if (imageUrl.startsWith("http")) return imageUrl;
			if (imageUrl.startsWith("Qm")) return `${IPFS_GATEWAY_URL}${imageUrl}`;
			if (imageUrl.startsWith("ipfs://")) {
				const hash = imageUrl.replace("ipfs://", "");
				return `${IPFS_GATEWAY_URL}${hash}`;
			}
			return "/images/cafe1.webp";
		} catch {
			return "/images/cafe1.webp";
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
							onClick={() => handleProductClick(favorite.product.id)}
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
