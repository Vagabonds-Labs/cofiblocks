"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ProductDetails from "~/app/_components/features/ProductDetails";

interface Product {
	id: number;
	tokenId: number;
	image: string;
	name: string;
	region: string;
	farmName: string;
	roastLevel: string;
	bagsAvailable: number;
	price: number;
	description: string;
	type: "Buyer" | "Farmer" | "SoldOut";
	process: string;
}

interface ApiResponse {
	id: number;
	tokenId: number;
	nftMetadata: NftMetadata;
	name: string;
	bagsAvailable: number;
	price: number;
	//process?: string;
}

interface NftMetadata {
	imageUrl: string;
	description: string;
	region: string;
	farmName: string;
	strength: string;
}

function ProductPage() {
	const { t } = useTranslation();
	const params = useParams();
	const productId = typeof params.id === "string" ? params.id : params.id?.[0];
	const [product, setProduct] = useState<Product | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (productId) {
			void fetchProductData(productId);
		}
	}, [productId]);

	const fetchProductData = async (id: string) => {
		try {
			setIsLoading(true);
			const response = await fetch(`/api/product/${id}`);
			if (!response.ok) {
				throw new Error(`Error fetching product: ${response.statusText}`);
			}
			const data = (await response.json()) as ApiResponse;

			const parsedMetadata: NftMetadata =
				typeof data.nftMetadata === "string"
					? (JSON.parse(data.nftMetadata) as NftMetadata)
					: data.nftMetadata;

			const product: Product = {
				id: Number(id),
				tokenId: data.tokenId,
				image: parsedMetadata.imageUrl,
				name: data.name,
				region: parsedMetadata.region,
				farmName: parsedMetadata.farmName,
				roastLevel: parsedMetadata.strength,
				bagsAvailable: data.bagsAvailable ?? 10,
				price: data.price,
				description: parsedMetadata.description,
				type: "Buyer",
				process: "Natural",
			};

			setProduct(product);
		} catch (error) {
			console.error("Failed to fetch product data:", error);
			setProduct(null);
		} finally {
			setIsLoading(false);
		}
	};

	if (isLoading) {
		return (
			<div className="w-full">
				<div className="pt-20">
					<div className="max-w-7xl mx-auto px-4">
						{/* Breadcrumb Skeleton */}
						<div className="flex mb-6 gap-2">
							<div className="h-5 w-24 bg-surface-primary-soft rounded animate-pulse" />
							<div className="h-5 w-2">/</div>
							<div className="h-5 w-32 bg-surface-primary-soft rounded animate-pulse" />
						</div>

						{/* Content Grid */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
							{/* Image Gallery Skeleton */}
							<div className="space-y-4">
								<div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-primary-soft animate-pulse" />
								<div className="grid grid-cols-4 gap-4">
									{/* Explicitly define array for type safety */}
									{["thumb1", "thumb2", "thumb3", "thumb4"].map((thumbId) => (
										<div
											key={thumbId}
											className="aspect-square rounded-lg bg-surface-primary-soft animate-pulse"
										/>
									))}
								</div>
							</div>

							{/* Product Info Skeleton */}
							<div className="space-y-6">
								<div className="space-y-2">
									<div className="h-5 w-24 bg-surface-primary-soft rounded animate-pulse" />
									<div className="h-8 w-3/4 bg-surface-primary-soft rounded animate-pulse" />
									<div className="h-5 w-1/2 bg-surface-primary-soft rounded animate-pulse" />
								</div>

								<div className="border-t border-b py-4">
									<div className="h-8 w-48 bg-surface-primary-soft rounded animate-pulse" />
									<div className="h-5 w-32 bg-surface-primary-soft rounded animate-pulse mt-1" />
								</div>

								<div className="space-y-2">
									<div className="h-5 w-full bg-surface-primary-soft rounded animate-pulse" />
									<div className="h-5 w-5/6 bg-surface-primary-soft rounded animate-pulse" />
									<div className="h-5 w-4/6 bg-surface-primary-soft rounded animate-pulse" />
								</div>

								<div className="grid grid-cols-2 gap-4">
									{/* Explicitly define array for type safety */}
									{["card1", "card2"].map((cardId) => (
										<div
											key={cardId}
											className="h-24 rounded-lg bg-surface-primary-soft animate-pulse"
										/>
									))}
								</div>

								<div className="h-40 rounded-lg bg-surface-primary-soft animate-pulse" />

								<div className="border-t pt-6 space-y-4">
									<div className="h-6 w-32 bg-surface-primary-soft rounded animate-pulse" />
									<div className="h-48 rounded-lg bg-surface-primary-soft animate-pulse" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!product) {
		return (
			<div className="min-h-screen w-full flex flex-col items-center justify-center">
				<h1 className="text-2xl font-bold">{t("product_not_found")}</h1>
			</div>
		);
	}

	return <ProductDetails product={product} />;
}

export default ProductPage;
