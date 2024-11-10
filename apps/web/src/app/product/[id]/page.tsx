"use client";

import SkeletonLoader from "@repo/ui/skeleton";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ProductDetails from "~/app/_components/features/ProductDetails";

interface Product {
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
	nftMetadata: string;
	name: string;
	region: string;
	farmName: string;
	strength: string;
	bagsAvailable: number;
	price: number;
	process?: string;
}

interface NftMetadata {
	imageUrl: string;
	description: string;
}

function ProductPage() {
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

			const parsedMetadata = JSON.parse(data.nftMetadata) as NftMetadata;

			const product: Product = {
				image: parsedMetadata.imageUrl,
				name: data.name,
				region: data.region,
				farmName: data.farmName,
				roastLevel: data.strength,
				bagsAvailable: data.bagsAvailable ?? 10,
				price: data.price,
				description: parsedMetadata.description,
				type: "SoldOut",
				process: data.process ?? "Natural",
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
			<div className="min-h-screen w-full flex flex-col pt-4">
				<div className="flex justify-center pl-12">
					<SkeletonLoader width="w-full max-w-[24.375rem]" height="h-[30rem]" />
				</div>
			</div>
		);
	}

	if (!product) {
		return (
			<div className="min-h-screen w-full flex flex-col items-center justify-center">
				<h1 className="text-2xl font-bold">Product not found</h1>
			</div>
		);
	}

	return <ProductDetails product={product} />;
}

export default ProductPage;
