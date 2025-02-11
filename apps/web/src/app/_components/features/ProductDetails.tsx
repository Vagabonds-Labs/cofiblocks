import { HeartIcon, ShareIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import Button from "@repo/ui/button";
import { DataCard } from "@repo/ui/dataCard";
import { InfoCard } from "@repo/ui/infoCard";
import PageHeader from "@repo/ui/pageHeader";
import { H1, H2, Text } from "@repo/ui/typography";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { api } from "~/trpc/react";
import { ProducerInfo } from "./ProducerInfo";
import { SelectionTypeCard } from "./SelectionTypeCard";

interface ProductDetailsProps {
	product: {
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
	};
	isConnected?: boolean;
	onConnect?: () => void;
}

export default function ProductDetails({
	product,
	isConnected,
	onConnect,
}: ProductDetailsProps) {
	const {
		image,
		name,
		farmName,
		roastLevel,
		bagsAvailable,
		price,
		type,
		process,
		description,
		region,
	} = product;

	const { t } = useTranslation();
	const [quantity, setQuantity] = useState(1);
	const [isLiked, setIsLiked] = useState(false);
	const [selectedImage, setSelectedImage] = useState(0);
	const router = useRouter();
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const { data: cart, refetch: refetchCart } = api.cart.getUserCart.useQuery();
	const { mutate: addToCart } = api.cart.addToCart.useMutation({
		onSuccess: () => {
			void refetchCart();
		},
	});

	const cartItemsCount =
		cart?.items?.reduce((total, item) => total + item.quantity, 0) ?? 0;
	const isSoldOut = type === "SoldOut";
	const isFarmer = type === "Farmer";

	// Mock data for demo - in real app, these would come from API
	const productImages = [
		{ id: "main", src: image },
		{ id: "detail-1", src: "/images/product-detail-2.webp" },
		{ id: "detail-2", src: "/images/product-detail-3.webp" },
		{ id: "detail-3", src: "/images/product-detail-4.webp" },
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
				title: name,
				text: description,
				url: window.location.href,
			});
		} catch (error) {
			console.error("Error sharing:", error);
		}
	};

	return (
		<div className="w-full">
			<PageHeader
				title={t("product_details")}
				showBackButton
				onBackClick={() => router.back()}
				showCart={true}
				cartItemsCount={cartItemsCount}
				rightActions={
					<div className="flex items-center space-x-2">
						<button
							type="button"
							onClick={handleShare}
							className="p-2 hover:bg-gray-100 rounded-full transition-colors"
							aria-label={t("share_product")}
						>
							<ShareIcon className="h-6 w-6" />
						</button>
						<button
							type="button"
							onClick={() => setIsLiked(!isLiked)}
							className="p-2 hover:bg-gray-100 rounded-full transition-colors"
							aria-label={
								isLiked ? t("remove_from_favorites") : t("add_to_favorites")
							}
						>
							{isLiked ? (
								<HeartSolidIcon className="h-6 w-6 text-red-500" />
							) : (
								<HeartIcon className="h-6 w-6" />
							)}
						</button>
					</div>
				}
			/>

			{/* Main Content with proper top spacing */}
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
						<span className="text-gray-900">{name}</span>
					</nav>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
						{/* Image Gallery */}
						<div className="space-y-4">
							<div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
								{productImages[selectedImage] && (
									<Image
										src={productImages[selectedImage].src}
										alt={name}
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
											alt={`${name} ${index + 1}`}
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
								<Text className="text-sm font-medium text-blue-600 mb-2">
									{region}
								</Text>
								<H1 className="text-3xl font-bold mb-2">{t(name)}</H1>
								<Text className="text-gray-600">{farmName}</Text>
							</div>

							<div className="border-t border-b py-4">
								<Text className="text-3xl font-bold text-gray-900">
									${price.toFixed(2)} USD
									<span className="text-base font-normal text-gray-500 ml-2">
										{t("per_unit")}
									</span>
								</Text>
								{!isSoldOut && (
									<Text className="text-sm text-gray-500 mt-1">
										{t("bags_available_count", { count: bagsAvailable })}
									</Text>
								)}
							</div>

							<Text className="text-gray-600">{description}</Text>

							<div className="grid grid-cols-2 gap-4">
								<DataCard
									label={t("roast_level")}
									value={t(`strength.${roastLevel.toLowerCase()}`)}
									iconSrc="/images/product-details/SandClock.svg"
								/>
								<DataCard
									label={t("process")}
									value={t(`processes.${process.toLowerCase()}`)}
									iconSrc="/images/product-details/Flame.svg"
								/>
							</div>

							{!isSoldOut && !isFarmer && (
								<SelectionTypeCard
									price={price}
									quantity={quantity}
									bagsAvailable={bagsAvailable}
									onQuantityChange={setQuantity}
									onAddToCart={handleAddToCart}
									isAddingToCart={isAddingToCart}
									isConnected={isConnected}
									onConnect={onConnect}
								/>
							)}

							<div className="border-t pt-6">
								<H2 className="text-lg font-semibold mb-4">
									{t("farm_details")}
								</H2>
								<ProducerInfo
									farmName={farmName}
									rating={4}
									salesCount={125}
									altitude={1680}
									coordinates="15 45 78 90 00 87 45"
									onWebsiteClick={() => void 0}
									isEditable={isFarmer}
								/>
								{isFarmer && (
									<Button className="w-full mt-4" onClick={() => void 0}>
										{t("edit_my_farm")}
									</Button>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
