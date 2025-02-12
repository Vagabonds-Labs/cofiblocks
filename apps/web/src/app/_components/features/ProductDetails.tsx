import { HeartIcon, ShareIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import type { JsonValue } from "@prisma/client/runtime/library";
import { DataCard } from "@repo/ui/dataCard";
import { H1, H2, Text } from "@repo/ui/typography";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "~/trpc/react";
import { ProducerInfo } from "./ProducerInfo";
import { SelectionTypeCard } from "./SelectionTypeCard";
import type { NftMetadata } from "./types";

interface ProductDetailsProps {
	product: {
		id: number;
		tokenId: number;
		name: string;
		price: number;
		nftMetadata: JsonValue;
		createdAt: Date;
		updatedAt: Date;
	};
	isConnected?: boolean;
	onConnect?: () => void;
}

export default function ProductDetails({
	product,
	isConnected,
	onConnect,
}: ProductDetailsProps) {
	const { t } = useTranslation();
	const [quantity, setQuantity] = useState(1);
	const [isLiked, setIsLiked] = useState(false);
	const [selectedImage, setSelectedImage] = useState(0);
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const { data: cart, refetch: refetchCart } = api.cart.getUserCart.useQuery();
	const { mutate: addToCart } = api.cart.addToCart.useMutation({
		onSuccess: () => {
			void refetchCart();
		},
	});

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

	const productImages = [
		{ id: "main", src: metadata?.imageUrl ?? "/images/cafe1.webp" },
	];

	const handleAddToCart = () => {
		setIsAddingToCart(true);
		addToCart(
			{
				productId: product.id,
				quantity: quantity,
			},
			{
				onSuccess: () => {
					setIsAddingToCart(false);
				},
				onError: () => {
					setIsAddingToCart(false);
				},
			},
		);
	};

	const handleShare = async () => {
		try {
			await navigator.share({
				title: product.name,
				text: metadata?.description ?? "",
				url: window.location.href,
			});
		} catch (error) {
			console.error("Error sharing:", error);
		}
	};

	return (
		<div className="pt-20">
			<div className="max-w-7xl mx-auto px-4">
				{/* Breadcrumb */}
				<nav className="flex mb-6 text-sm text-gray-500">
					<Link
						href="/marketplace"
						className="hover:text-gray-900 transition-colors"
					>
						{t("marketplace")}
					</Link>
					<span className="mx-2">/</span>
					<span className="text-gray-900">{product.name}</span>
				</nav>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
					{/* Image Gallery */}
					<div className="space-y-4">
						<div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
							{productImages[selectedImage] && (
								<Image
									src={productImages[selectedImage].src}
									alt={product.name}
									fill
									className="object-cover hover:scale-105 transition-transform duration-300"
									sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
									priority
								/>
							)}
						</div>
						<div className="grid grid-cols-4 gap-4">
							{productImages.map((img, index) => (
								<button
									key={img.id}
									onClick={() => setSelectedImage(index)}
									className={`relative aspect-square rounded-lg overflow-hidden ${
										selectedImage === index ? "ring-2 ring-blue-500" : ""
									}`}
									type="button"
								>
									<Image
										src={img.src}
										alt={`${product.name} ${index + 1}`}
										fill
										className="object-cover"
										sizes="(max-width: 768px) 25vw, 20vw"
									/>
								</button>
							))}
						</div>
					</div>

					{/* Product Info */}
					<div className="space-y-6">
						<div>
							<H1 className="text-3xl font-bold mb-2">{product.name}</H1>
							<Text className="text-gray-600">
								{metadata?.farmName ?? t("unknown_farm")}
							</Text>
						</div>

						<div className="flex items-center justify-between">
							<div>
								<Text className="text-sm text-gray-500">{t("price")}</Text>
								<Text className="text-2xl font-bold">
									{t("price_with_currency", { price: product.price })}
								</Text>
							</div>
							<div className="flex space-x-2">
								<button
									onClick={() => setIsLiked(!isLiked)}
									className="p-2 hover:bg-gray-100 rounded-full transition-colors"
									type="button"
									aria-label={isLiked ? t("unlike") : t("like")}
								>
									{isLiked ? (
										<HeartSolidIcon className="w-6 h-6 text-red-500" />
									) : (
										<HeartIcon className="w-6 h-6" />
									)}
								</button>
								<button
									onClick={handleShare}
									className="p-2 hover:bg-gray-100 rounded-full transition-colors"
									type="button"
									aria-label={t("share")}
								>
									<ShareIcon className="w-6 h-6" />
								</button>
							</div>
						</div>

						<div className="space-y-4">
							<H2 className="text-xl font-semibold">{t("description")}</H2>
							<Text className="text-gray-600">
								{metadata?.description ?? t("no_description")}
							</Text>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<DataCard
								title={t("region")}
								value={metadata?.region ?? t("unknown_region")}
							/>
							<DataCard
								title={t("strength")}
								value={t(`strength.${metadata?.strength?.toLowerCase()}`)}
							/>
						</div>

						<SelectionTypeCard
							price={product.price}
							quantity={quantity}
							bagsAvailable={10}
							onQuantityChange={setQuantity}
							onAddToCart={handleAddToCart}
							onConnect={onConnect}
							isAddingToCart={isAddingToCart}
							isConnected={isConnected}
						/>

						<ProducerInfo
							farmName={metadata?.farmName ?? t("unknown_farm")}
							region={metadata?.region ?? t("unknown_region")}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
