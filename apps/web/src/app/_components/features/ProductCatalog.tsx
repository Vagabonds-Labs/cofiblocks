import { ProductCard } from "@repo/ui/productCard";
import { useCallback, useEffect, useState } from "react";
import { api } from "~/trpc/react";
import type { NftMetadata, Product } from "./types";

export default function ProductCatalog() {
	// Local state to hold all products fetched from the server
	const [products, setProducts] = useState<Product[]>([]);

	// Using an infinite query to fetch products with pagination
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
		api.product.getProducts.useInfiniteQuery(
			{
				limit: 3, // Fetch 3 products per request
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			},
		);

	// Effect to update local state whenever new data is loaded
	useEffect(() => {
		if (data) {
			const allProducts = data.pages.flatMap((page) => page.products); // Flatten the pages to get all products
			setProducts(allProducts);
		}
	}, [data]);

	// Handle infinite scroll for fetching more products as the user scrolls down
	const handleScroll = useCallback(() => {
		if (
			window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && // Check if near bottom
			!isFetchingNextPage &&
			hasNextPage
		) {
			void fetchNextPage(); // Fetch the next set of products
		}
	}, [isFetchingNextPage, hasNextPage, fetchNextPage]);

	// Attach and detach scroll event listeners
	useEffect(() => {
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [handleScroll]);

	// Placeholder for adding products to the cart
	const handleAddToCart = (_productId: number) => {
		// TODO: Add logic for adding product to cart.
	};

	// Render each product
	const renderProduct = (product: Product) => {
		let metadata: NftMetadata | null = null;

		if (typeof product.nftMetadata === "string") {
			try {
				metadata = JSON.parse(product.nftMetadata) as NftMetadata; // Try to parse if it's a JSON string
			} catch {
				metadata = null; // Fallback in case of an error
			}
		} else {
			metadata = product.nftMetadata as NftMetadata; // Assign directly if it's already an object
		}

		return (
			<ProductCard
				key={product.id}
				image={metadata?.imageUrl ?? "/default-image.webp"} // Fallback image
				region={product.region}
				farmName={product.farmName}
				variety={product.name}
				price={product.price}
				badgeText={product.strength}
				isAddingToShoppingCart={false} // Disable shopping cart action for now
				onClick={() => handleAddToCart(product.id)} // Trigger add-to-cart action
			/>
		);
	};

	return (
		<div className="flex flex-col items-center gap-6 p-4 mx-auto">
			{isLoading && <div className="mt-4">Loading...</div>}
			{products.map(renderProduct)}
			{isFetchingNextPage && (
				<div className="mt-4">Loading more products...</div>
			)}
		</div>
	);
}
