"use client";

import { MapPinIcon, UserIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React from "react";
import { useTranslation } from "react-i18next";
import ProductStatusDetails from "~/app/_components/features/ProductStatusDetails";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import { api } from "~/trpc/react";

interface NFTMetadata {
	description: string;
	imageUrl: string;
	imageAlt: string;
	region: string;
	farmName: string;
	strength: string;
	roast: string;
}

export default function SaleDetails() {
	const { t } = useTranslation();
	const { id: orderId } = useParams();
	const { data: session } = useSession();
	const isProducer = session?.user?.role === "COFFEE_PRODUCER";

	const { data: orderItem, isLoading } = api.order.getOrderItem.useQuery(
		{ orderItemId: orderId as string },
		{
			enabled: !!orderId,
		},
	);

	const { data: orderDelivery } = api.order.getOrderDelivery.useQuery(
		{ orderId: orderItem?.orderId ?? "" },
		{
			enabled: !!orderItem?.orderId,
		},
	);

	if (isLoading) {
		return (
			<ProfileOptionLayout title="" backLink="/user/my-sales">
				<div className="space-y-4">
					<div className="animate-pulse h-6 bg-gray-200 rounded w-1/4" />
					<div className="space-y-2">
						<div className="animate-pulse h-20 bg-gray-200 rounded" />
						<div className="animate-pulse h-20 bg-gray-200 rounded" />
					</div>
				</div>
			</ProfileOptionLayout>
		);
	}

	if (!orderItem) {
		return (
			<ProfileOptionLayout title="" backLink="/user/my-sales">
				<div className="text-center py-8">
					<p className="text-gray-600">{t("order_not_found")}</p>
				</div>
			</ProfileOptionLayout>
		);
	}

	let nftMetadata: NFTMetadata | null = null;
	try {
		const rawMetadata = orderItem.product.nftMetadata;
		if (typeof rawMetadata === "string") {
			nftMetadata = JSON.parse(rawMetadata) as NFTMetadata;
		}
	} catch (error) {
		console.error("Error parsing NFT metadata:", error);
	}

	// Helper function to get product image from metadata
	const getProductImageUrl = (nftMetadata: NFTMetadata | null) => {
		if (!nftMetadata?.imageUrl) return "/images/cafe2.webp";

		const imageUrl = nftMetadata.imageUrl;
		const IPFS_GATEWAY_URL = "https://gateway.pinata.cloud/ipfs/";
		
		// If it's already a full URL, use it
		if (imageUrl.startsWith("http")) return imageUrl;
		
		// If it's an IPFS hash, construct the gateway URL
		if (imageUrl.startsWith("Qm")) {
			return `${IPFS_GATEWAY_URL}${imageUrl}`;
		}
		
		// If it's an IPFS URL, extract hash and construct gateway URL
		if (imageUrl.startsWith("ipfs://")) {
			const hash = imageUrl.replace("ipfs://", "");
			return `${IPFS_GATEWAY_URL}${hash}`;
		}
		
		// Fallback to default image
		return "/images/cafe2.webp";
	};

	const orderDetails = {
		productName: orderItem.product.name ?? t("unknown_product"),
		status: orderItem.order.status,
		roast: nftMetadata?.roast ?? nftMetadata?.strength ?? t("unknown_roast"),
		type: t("grounded"), // TODO: Add type to product metadata
		quantity: `${orderItem.quantity ?? 0} ${t("bags")}`,
		delivery: orderItem.order.home_delivery ? t("my_home") : t("pick_up_at_meetup"),
		address: orderDelivery?.address ?? "",
		totalPrice: `${orderItem.price * orderItem.quantity} ${t("usd")}`,
		productImage: getProductImageUrl(nftMetadata),
	};

	return (
		<ProfileOptionLayout title={t("sale_details")} backLink="/user/my-sales">
			<div className="space-y-4">
				{/* Order Summary Card - Mobile Optimized */}
				<div className="bg-white rounded-lg p-4">
					<div className="flex items-start space-x-3 mb-4">
						<Image
							src={orderDetails.productImage}
							alt={t("product_image_alt", { productName: orderDetails.productName })}
							width={64}
							height={64}
							className="w-16 h-16 rounded-md object-cover flex-shrink-0"
						/>
						<div className="flex-grow min-w-0">
							<h2 className="text-lg font-semibold text-content-title mb-1">
								{orderDetails.productName}
							</h2>
							<div className="space-y-1 text-sm">
								<div className="flex justify-between">
									<span className="text-content-body-soft">{t("order_id")}</span>
									<span className="font-mono text-content-body-default">{orderId}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-content-body-soft">{t("order_date")}</span>
									<span className="text-content-body-default">
										{new Date(orderItem.order.createdAt).toLocaleDateString()}
									</span>
								</div>
								<div className="flex justify-between items-center pt-2 border-t border-gray-100">
									<span className="text-content-body-soft font-medium">{t("total_amount")}</span>
									<span className="text-lg font-bold text-green-600">
										{orderDetails.totalPrice}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Buyer Information Card - Mobile Optimized */}
				<div className="bg-white rounded-lg p-4">
					<h2 className="text-lg font-semibold mb-4 text-content-title">{t("buyer_information")}</h2>
					<div className="space-y-4">
						<div className="flex items-start space-x-3">
							<UserIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
							<div className="flex-grow min-w-0">
								<p className="font-medium text-content-title">
									{orderItem.order.user?.name ?? t("unknown_buyer")}
								</p>
								<p className="text-sm text-content-body-soft break-all">{orderItem.order.user?.email}</p>
							</div>
						</div>
						<div className="flex items-start space-x-3">
							<MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
							<div className="flex-grow min-w-0">
								<p className="font-medium text-content-title">{t("delivery_address")}</p>
								<p className="text-sm text-content-body-soft">
									{orderDetails.address || t("no_address_provided")}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Product Details Card - Mobile Optimized */}
				<div className="bg-white rounded-lg p-4">
					<ProductStatusDetails
						productDetails={orderDetails}
						isProducer={isProducer}
					/>
				</div>
			</div>
		</ProfileOptionLayout>
	);
}
