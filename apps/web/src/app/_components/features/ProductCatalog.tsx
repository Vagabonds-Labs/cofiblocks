import Button from "@repo/ui/button";
import { ProductCard } from "@repo/ui/productCard";
import SkeletonLoader from "@repo/ui/skeleton";
import { useAtom } from "jotai";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
	isLoadingAtom,
	quantityOfProducts,
	searchQueryAtom,
	searchResultsAtom,
} from "~/atoms/productAtom";
import { api } from "~/trpc/react";
import type { NftMetadata, Product } from "./types";

export default function ProductCatalog() {
	const [products, setProducts] = useState<Product[]>([]);
	const [results, setSearchResults] = useAtom(searchResultsAtom);
	const [isLoadingResults, setIsLoading] = useAtom(isLoadingAtom);
	const [quantity, setQuantityProducts] = useAtom(quantityOfProducts);
	const [query, setQuery] = useAtom(searchQueryAtom);

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

	const clearSearch = () => {
		setQuantityProducts(0);
		setSearchResults([]);
		setIsLoading(false);
		setQuery("");
	};

	return (
		<div className="flex flex-col items-center gap-6 p-4 mx-auto">
			{isLoadingResults ? (
				<SkeletonLoader />
			) : (
				<>
					{results.length > 0 ? (
						<div>
							<div className="flex justify-between mb-2">
								<div>{quantity} products found</div>
								<button
									type="button"
									className="underline cursor-pointer"
									onClick={() => clearSearch()}
								>
									Clear search
								</button>
							</div>
							{results.map(renderProduct)}
						</div>
					) : query ? (
						<div className="flex flex-col justify-center items-center">
							<div>
								<Image
									src="/images/NoResultsImage.png"
									width={700}
									height={700}
									alt="No results"
								/>
							</div>
							<div className="flex justify-center mt-4">
								<Button
									variant="primary"
									size="sm"
									onClick={() => clearSearch()}
								>
									Clear search
								</Button>
							</div>
						</div>
					) : (
						products.map(renderProduct)
					)}

					{isFetchingNextPage && <SkeletonLoader />}
				</>
			)}
		</div>
	);
}
