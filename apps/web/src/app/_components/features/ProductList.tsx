"use client";

import { useAtom } from "jotai";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { addItemAtom } from "~/store/cartAtom";
import { api } from "~/trpc/react";

interface ProductMetadata {
	imageUrl: string;
	description: string;
}

interface Product {
	id: number;
	tokenId: number;
	name: string;
	price: number;
	description: string;
	stock: number;
	ground_stock: number;
	bean_stock: number;
	owner?: string | null;
	initial_stock?: number | null;
	creation_tx_hash?: string | null;
	hidden?: boolean | null;
	nftMetadata: string | ProductMetadata;
	createdAt: Date;
	updatedAt: Date;
}

interface ProductListProps {
	products: Product[];
}

function isValidMetadata(metadata: unknown): metadata is ProductMetadata {
	if (!metadata || typeof metadata !== "object") return false;

	const candidate = metadata as Record<string, unknown>;
	return (
		"imageUrl" in candidate &&
		typeof candidate.imageUrl === "string" &&
		"description" in candidate &&
		typeof candidate.description === "string"
	);
}

function parseMetadata(nftMetadata: string | ProductMetadata): ProductMetadata {
	if (typeof nftMetadata === "string") {
		try {
			// Type assertion after parsing to unknown first, then validate
			const parsed = JSON.parse(nftMetadata) as unknown;
			if (isValidMetadata(parsed)) {
				return parsed;
			}
		} catch (error) {
			console.warn("Failed to parse metadata:", error);
		}
	} else if (isValidMetadata(nftMetadata)) {
		return nftMetadata;
	}

	// Default metadata if parsing fails or validation fails
	return {
		imageUrl: "/default-image.webp",
		description: "",
	};
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
				const metadata = parseMetadata(product.nftMetadata);

				const optimisticItem = {
					id: `temp-${Date.now()}`,
					productId: product.id,
					quantity: newItem.quantity,
					is_grounded: newItem.is_grounded,
					createdAt: now,
					updatedAt: now,
					shoppingCartId: "temp",
					product: {
						id: product.id,
						tokenId: product.tokenId,
						name: product.name,
						price: product.price,
						hidden: product.hidden ?? false,
						stock: product.stock,
						ground_stock: product.ground_stock,
						bean_stock: product.bean_stock,
						owner: product.owner ?? null,
						initial_stock: product.initial_stock ?? null,
						creation_tx_hash: product.creation_tx_hash ?? null,
						nftMetadata: JSON.stringify(metadata),
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
			toast.error(t("error_adding_to_cart"));
		},
		onSettled: () => {
			void utils.cart.getUserCart.invalidate();
		},
	});

	const handleAddToCart = (product: Product) => {
		if (product.stock <= 0) {
			toast.error(t("error_out_of_stock"));
			return;
		}

		// Default to grounded if available, otherwise bean
		const isGrounded = product.ground_stock > 0;

		addToCart({
			productId: product.id,
			quantity: 1,
			is_grounded: isGrounded,
		});

		const metadata = parseMetadata(product.nftMetadata);

		addItem({
			id: product.id.toString(),
			tokenId: product.tokenId,
			name: product.name,
			price: product.price,
			quantity: 1,
			imageUrl: metadata.imageUrl,
			is_grounded: isGrounded,
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
