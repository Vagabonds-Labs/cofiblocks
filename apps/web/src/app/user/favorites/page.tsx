"use client";

import { ProductCard } from "@repo/ui/productCard";
import { useAtom, useAtomValue } from "jotai";
import React from "react";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import { addItemAtom, cartItemsAtom } from "~/store/cartAtom";

const userFavoriteProducts = [
	{
		id: 2,
		title: "Café de Especialidad 2",
		description: "Descripción del Café de Especialidad 2.",
		imageUrl: "/images/cafe2.webp",
		imageAlt: "Paquete de Café de Especialidad 2",
	},
	{
		id: 5,
		title: "Café de Especialidad 5",
		description: "Descripción del Café de Especialidad 5.",
		imageUrl: "/images/cafe5.webp",
		imageAlt: "Paquete de Café de Especialidad 5",
	},
];

export default function Favorites() {
	// TODO: Get favorites from the database
	// TODO: Consider sending a "flag" to ProductCatalog to show favorites instead of all products to reuse the same component
	// and avoid code duplication
	const [addedProduct, setAddedProduct] = React.useState<number | null>(null);

	const items = useAtomValue(cartItemsAtom);
	const [, addItem] = useAtom(addItemAtom);

	const handleAddToCart = (productId: number) => {
		addItem({
			id: productId.toString(),
			name: "Product Name",
			quantity: 1,
			price: 10.0,
			imageUrl: "/default-image.webp",
		});
		setAddedProduct(productId);
	};

	return (
		<ProfileOptionLayout title="Favorite products">
			<div className="flex flex-col items-center gap-6 p-4 mx-auto">
				{userFavoriteProducts.map(({ id, imageUrl }) => (
					<div key={id} className="w-full max-w-md flex justify-center">
						<ProductCard
							image={imageUrl}
							region="Region"
							farmName="Farm Name"
							variety="Variety"
							price={10.0}
							badgeText="Badge Text"
							onClick={() => handleAddToCart(id)}
							isAddingToShoppingCart={addedProduct === id}
						/>
					</div>
				))}
			</div>
		</ProfileOptionLayout>
	);
}
