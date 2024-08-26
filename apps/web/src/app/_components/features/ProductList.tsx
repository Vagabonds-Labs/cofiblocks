"use client";

import { api } from "~/trpc/react";

interface Product {
	id: number;
	name: string;
	price: number;
	description: string;
}

interface ProductListProps {
	products: Product[];
}

export default function ProductList({ products }: ProductListProps) {
	const utils = api.useUtils();

	const { mutate: addToCart } = api.shoppingCart.addItem.useMutation({
		onSuccess: async () => {
			await utils.shoppingCart.getItems.invalidate();
		},
	});

	const handleAddToCart = (productId: number) => {
		addToCart({ cartId: 0, productId, quantity: 1 });
	};

	return (
		<div>
			<h2 className="text-2xl font-bold mb-4">Products</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{products.map((product) => (
					<div key={product.id} className="border p-4 rounded-lg">
						<h3 className="text-xl font-semibold mb-2">{product.name}</h3>
						<p className="text-gray-700 mb-2">{product.description}</p>
						<p className="text-lg font-bold mb-4">
							${product.price.toFixed(2)}
						</p>
						<button
							onClick={() => handleAddToCart(product.id)}
							className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark"
							type="button"
							aria-label={`Add ${product.name} to cart`}
						>
							Add to Cart
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
