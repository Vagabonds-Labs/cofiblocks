"use client";

import { useAtom } from "jotai";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { addItemAtom } from "~/store/cartAtom";
import { api } from "~/trpc/react";

interface Product {
	id: number;
	tokenId: number;
	name: string;
	price: number;
	description: string;
}

interface ProductListProps {
	products: Product[];
}

export default function ProductList({ products }: ProductListProps) {
	const { t } = useTranslation();
	const [, addItem] = useAtom(addItemAtom);
	const utils = api.useUtils();

	// Add to cart mutation with optimistic updates
	const { mutate: addToCart } = api.cart.addToCart.useMutation({
		onMutate: async (newItem) => {
			await utils.cart.getUserCart.cancel();
			const previousCart = utils.cart.getUserCart.getData();

			const product = products.find((p) => p.id === newItem.productId);
			if (!product) return { previousCart };

			if (previousCart) {
				const now = new Date();
				const optimisticItem = {
					id: `temp-${Date.now()}`,
					productId: product.id,
					quantity: newItem.quantity,
					createdAt: now,
					updatedAt: now,
					shoppingCartId: "temp",
					product: {
						id: product.id,
						tokenId: product.tokenId,
						name: product.name,
						price: product.price,
						hidden: false,
						nftMetadata: JSON.stringify({
							imageUrl: "/default-image.webp",
							description: product.description,
						}),
						createdAt: now,
						updatedAt: now,
					},
				};

				utils.cart.getUserCart.setData(undefined, {
					...previousCart,
					items: [...previousCart.items, optimisticItem],
				});
			}

			return { previousCart };
		},
		onError: (err, variables, context) => {
			if (context?.previousCart) {
				utils.cart.getUserCart.setData(undefined, context.previousCart);
			}
			toast.error(err.message || t("error_adding_to_cart"));
		},
		onSuccess: (newItem) => {
			toast.success(t("item_added_to_cart"));
		},
		onSettled: () => {
			void utils.cart.getUserCart.invalidate();
		},
	});

	const handleAddToCart = (product: Product) => {
		addToCart({
			productId: product.id,
			quantity: 1,
		});
	};

	return (
		<div>
			<h2 className="text-2xl font-bold mb-4">{t("products")}</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{products.map((product) => (
					<div key={product.id} className="border p-4 rounded-lg">
						<h3 className="text-xl font-semibold mb-2">{product.name}</h3>
						<p className="text-gray-700 mb-2">{product.description}</p>
						<p className="text-lg font-bold mb-4">
							${product.price.toFixed(2)}
						</p>
						<button
							onClick={() => handleAddToCart(product)}
							className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark"
							type="button"
							aria-label={`Add ${product.name} to cart`}
						>
							{t("add_to_cart")}
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
