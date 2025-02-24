import { HeartIcon, ShareIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import Button from "@repo/ui/button";
import { DataCard } from "@repo/ui/dataCard";
import { H2, Text } from "@repo/ui/typography";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "~/trpc/react";
import { ProducerInfo } from "./ProducerInfo";
import { SelectionTypeCard } from "./SelectionTypeCard";

const IPFS_GATEWAY_URL = "https://gateway.pinata.cloud/ipfs/";

interface ProductDetailsProps {
	product: {
		id: number;
		tokenId: number;
		image: string;
		name: string;
		region: string;
		farmName: string;
		roastLevel: string;
		stock: number;
		price: number;
		description: string;
		type: "Buyer" | "Farmer" | "SoldOut";
		process: string;
		bagsAvailable?: number | null;
	};
	isConnected?: boolean;
	onConnect?: () => void;
	isFavorited?: boolean;
	onToggleFavorite?: () => void;
	isLoadingFavorite?: boolean;
}

interface CoinGeckoResponse {
	starknet: {
		usd: number;
	};
}

const getImageUrl = (src: string) => {
	if (src.startsWith("Qm")) {
		return `${IPFS_GATEWAY_URL}${src}`;
	}
	if (src.startsWith("ipfs://")) {
		return `${IPFS_GATEWAY_URL}${src.replace("ipfs://", "")}`;
	}
	if (
		src.startsWith("http://") ||
		src.startsWith("https://") ||
		src.startsWith("/")
	) {
		return src;
	}
	return "/images/cafe1.webp"; // Fallback image
};

export default function ProductDetails({
	product,
	isConnected,
	onConnect,
	isFavorited,
	onToggleFavorite,
	isLoadingFavorite,
}: ProductDetailsProps) {
	const {
		image,
		name,
		farmName,
		roastLevel,
		stock,
		price,
		type,
		process,
		description,
		region,
		bagsAvailable,
	} = product;

	const { t } = useTranslation();
	const [quantity, setQuantity] = useState(1);
	const [selectedImage, setSelectedImage] = useState(0);
	const [strkPrice, setStrkPrice] = useState<number | null>(null);
	const [isLoadingPrice, setIsLoadingPrice] = useState(false);
	const router = useRouter();
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const { refetch: refetchCart } = api.cart.getUserCart.useQuery();
	const { mutate: addToCart } = api.cart.addToCart.useMutation({
		onSuccess: () => {
			void refetchCart();
		},
	});
	const { data: session } = useSession();

	useEffect(() => {
		const fetchStrkPrice = async () => {
			try {
				setIsLoadingPrice(true);
				const response = await fetch(
					"https://api.coingecko.com/api/v3/simple/price?ids=starknet&vs_currencies=usd",
				);
				const data = (await response.json()) as CoinGeckoResponse;
				const strkUsdPrice = data.starknet.usd;
				setStrkPrice(price / strkUsdPrice);
			} catch (error) {
				console.error("Error fetching STRK price:", error);
				setStrkPrice(null);
			} finally {
				setIsLoadingPrice(false);
			}
		};

		void fetchStrkPrice();

		// Refresh price every 5 minutes
		const interval = setInterval(
			() => {
				void fetchStrkPrice();
			},
			5 * 60 * 1000,
		);

		return () => clearInterval(interval);
	}, [price]);

	// Only mark as sold out if stock is 0 or type is SoldOut
	const isSoldOut = stock === 0 || type === "SoldOut";
	const isFarmer = type === "Farmer";

	// Update productImages to use getImageUrl
	const productImages = [
		{ id: "main", src: getImageUrl(image) },
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

	const handleFavoriteClick = () => {
		console.log("Favorite clicked", { isConnected, isFavorited, session });
		if (!session) {
			// If not authenticated, trigger connect
			onConnect?.();
			return;
		}
		if (onToggleFavorite) {
			onToggleFavorite();
		}
	};

	return (
		<div className="w-full">
			{/* Navigation Bar */}
			<div className="sticky top-0 z-50 bg-white">
				<div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
					{/* Left Side: Breadcrumbs */}
					<nav className="flex items-center text-sm text-gray-500">
						<button
							type="button"
							onClick={() => router.back()}
							className="hover:text-gray-900 transition-colors flex items-center"
						>
							<svg
								className="w-5 h-5 mr-2"
								viewBox="0 0 20 20"
								fill="currentColor"
								aria-hidden="true"
								role="presentation"
							>
								<path
									fillRule="evenodd"
									d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
									clipRule="evenodd"
								/>
							</svg>
							{t("marketplace")}
						</button>
						<span className="mx-2">/</span>
						<span className="text-gray-900 font-medium">{name}</span>
					</nav>

					{/* Right Side: Actions */}
					<div className="flex items-center space-x-4">
						{/* Share and Like Buttons */}
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
								onClick={handleFavoriteClick}
								disabled={isLoadingFavorite}
								className="p-2 hover:bg-gray-100 rounded-full transition-colors"
								aria-label={
									isFavorited
										? t("remove_from_favorites")
										: t("add_to_favorites")
								}
							>
								{isFavorited ? (
									<HeartSolidIcon className="h-6 w-6 text-red-500" />
								) : (
									<HeartIcon className="h-6 w-6" />
								)}
							</button>
						</div>

						{/* Add to Cart Button */}
						{!isSoldOut && !isFarmer && (
							<Button
								onClick={isConnected ? handleAddToCart : onConnect}
								disabled={isAddingToCart || stock === 0}
								className="bg-yellow-400 hover:bg-yellow-500 text-black px-6"
							>
								{isAddingToCart
									? t("adding_to_cart")
									: isConnected
										? t("add_to_cart")
										: t("connect_to_buy")}
							</Button>
						)}
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 pt-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
					{/* Image Gallery */}
					<div className="space-y-4">
						<div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
							{productImages[selectedImage] && (
								<>
									<Image
										src={productImages[selectedImage].src}
										alt={name}
										fill
										className="object-cover hover:scale-105 transition-transform duration-300"
										sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
										priority
									/>
									{isSoldOut && (
										<div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
											<span className="text-white text-2xl font-bold px-6 py-2 bg-red-600 rounded-lg">
												{t("sold_out")}
											</span>
										</div>
									)}
								</>
							)}
						</div>
						{productImages.length > 1 && (
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
						)}
					</div>

					{/* Product Info */}
					<div className="space-y-6">
						<div>
							<Text className="text-sm font-medium text-blue-600 mb-2">
								{region}
							</Text>
							<Text className="text-gray-600">{farmName}</Text>
						</div>

						<div className="border-t border-b py-4">
							<div className="flex items-center justify-between mb-2">
								<Text className="text-3xl font-bold text-gray-900">
									${price.toFixed(2)} USD
									<span className="text-base font-normal text-gray-500 ml-2">
										{t("per_unit")}
									</span>
								</Text>
								<div className="flex items-center">
									<div
										className={`w-2 h-2 rounded-full ${isSoldOut ? "bg-red-500" : stock <= 5 ? "bg-orange-500" : stock <= 15 ? "bg-yellow-500" : "bg-green-500"} mr-2`}
									/>
									<Text
										className={`text-sm ${isSoldOut ? "text-red-600 font-medium" : "text-gray-600"}`}
									>
										{isSoldOut
											? t("stock_status.sold_out")
											: stock <= 5
												? t("stock_status.low_stock_left", { count: stock })
												: stock <= 15
													? t("stock_status.stock_available", { count: stock })
													: t("stock_status.in_stock", { count: stock })}
									</Text>
								</div>
							</div>
							{isLoadingPrice ? (
								<Text className="text-sm text-gray-500 mt-1">
									{t("loading_strk_price")}
								</Text>
							) : strkPrice ? (
								<Text className="text-sm text-gray-500 mt-1">
									≈ {strkPrice.toFixed(2)} STRK
								</Text>
							) : null}
							{isSoldOut ? (
								<Text className="text-sm text-red-600 font-medium mt-1">
									{t("product_sold_out")}
								</Text>
							) : (
								<Text className="text-sm text-gray-500 mt-1">
									{t("stock_available", { count: stock })}
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
								stock={stock}
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
	);
}
