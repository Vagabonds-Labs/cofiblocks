import Button from "@repo/ui/button";
import { ProductCard } from "@repo/ui/productCard";
import SkeletonLoader from "@repo/ui/skeleton";
import { useAtom } from "jotai";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	isLoadingAtom,
	quantityOfProducts,
	searchQueryAtom,
	searchResultsAtom,
} from "~/atoms/productAtom";
import { api } from "~/trpc/react";
import type { NftMetadata, Product } from "./types";

export default function ProductCatalog() {
	const { t } = useTranslation();
	const [products, setProducts] = useState<Product[]>([]);
	const [results, setSearchResults] = useAtom(searchResultsAtom);
	const [isLoadingResults, setIsLoading] = useAtom(isLoadingAtom);
	const [quantity, setQuantityProducts] = useAtom(quantityOfProducts);
	const [query, setQuery] = useAtom(searchQueryAtom);
	const router = useRouter();

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
		api.product.getProducts.useInfiniteQuery(
			{
				limit: 3,
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			},
		);

	useEffect(() => {
		if (data) {
			const allProducts = data.pages.flatMap((page) =>
				page.products.map((product) => ({
					...product,
					process: "Natural",
				})),
			);
			setProducts(allProducts);
		}
	}, [data]);

	const handleScroll = useCallback(() => {
		if (
			window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
			!isFetchingNextPage &&
			hasNextPage
		) {
			void fetchNextPage();
		}
	}, [isFetchingNextPage, hasNextPage, fetchNextPage]);

	useEffect(() => {
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [handleScroll]);

	const accessProductDetails = (productId: number) => {
		router.push(`/product/${productId}`);
	};

	const renderProduct = (product: Product) => {
		let metadata: NftMetadata | null = null;

		if (typeof product.nftMetadata === "string") {
			try {
				metadata = JSON.parse(product.nftMetadata) as NftMetadata;
			} catch {
				metadata = null;
			}
		} else {
			metadata = product.nftMetadata as NftMetadata;
		}

		return (
			<ProductCard
				key={product.id}
				image={metadata?.imageUrl ?? "/images/cafe1.webp"}
				region={metadata?.region ?? ""}
				farmName={metadata?.farmName ?? ""}
				variety={t(product.name)}
				price={product.price}
				badgeText={t(`strength.${metadata?.strength.toLowerCase()}`)}
				onClick={() => accessProductDetails(product.id)}
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
								<div>{t("products_found", { count: quantity })}</div>
								<button
									type="button"
									className="underline cursor-pointer"
									onClick={() => clearSearch()}
								>
									{t("clear_search")}
								</button>
							</div>
							{results.map((product) => (
								<div key={product.id}>{renderProduct(product)}</div>
							))}
						</div>
					) : query ? (
						<div className="flex flex-col justify-center items-center">
							<div>
								<Image
									src="/images/NoResultsImage.png"
									width={700}
									height={700}
									alt={t("no_results_image_alt")}
								/>
							</div>
							<div className="flex justify-center mt-4">
								<Button
									variant="primary"
									size="sm"
									onClick={() => clearSearch()}
								>
									{t("clear_search")}
								</Button>
							</div>
						</div>
					) : (
						products.map((product) => (
							<div key={product.id}>{renderProduct(product)}</div>
						))
					)}

					{isFetchingNextPage && <SkeletonLoader />}
				</>
			)}
		</div>
	);
}
