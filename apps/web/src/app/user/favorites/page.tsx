"use client";

import { ProductCard } from "@repo/ui/productCard";
import React from "react";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import { api } from "~/trpc/react";

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

	const utils = api.useUtils();

	const { mutate: addItem } = api.shoppingCart.addItem.useMutation({
		onSuccess: async () => {
			await utils.shoppingCart.getItems.invalidate();
			setAddedProduct(null);
		},
	});

	const handleAddToCart = (productId: number) => {
		const cartId = 1;

		addItem({ cartId, productId, quantity: 1 });
		setAddedProduct(productId);
	};

	return (
		<ProfileOptionLayout title="Favorite products">
			<div className="flex flex-col items-center gap-6 p-4 mx-auto">
				{userFavoriteProducts.map(
					({ id, title, description, imageUrl, imageAlt }) => (
						<div key={id} className="w-full max-w-md flex justify-center">
							<ProductCard
								image={imageUrl}
								title={title}
								price={10.0}
								available={100}
								onClick={() => handleAddToCart(id)}
								isAddingToShoppingCart={addedProduct === id}
							/>
						</div>
					),
				)}
			</div>
		</ProfileOptionLayout>
	);
}
