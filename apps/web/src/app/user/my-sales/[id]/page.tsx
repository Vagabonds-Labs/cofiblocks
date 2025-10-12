"use client";

import { MapPinIcon, UserIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
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

	const orderDetails = {
		productName: orderItem.product.name ?? t("unknown_product"),
		status: orderItem.order.status,
		roast: nftMetadata?.roast ?? t("unknown_roast"),
		type: t("grounded"), // TODO: Add type to product metadata
		quantity: `${orderItem.quantity ?? 0} ${t("bags")}`,
		delivery: orderItem.order.home_delivery ? t("my_home") : t("pick_up_at_meetup"),
		address: orderDelivery?.address ?? "",
		totalPrice: `${orderItem.price * orderItem.quantity} ${t("usd")}`,
	};

	return (
		<ProfileOptionLayout title={t("sale_details")} backLink="/user/my-sales">
			{/* Order Summary Card */}
			<div className="bg-white rounded-lg p-6 mb-6">
				<h2 className="text-xl font-semibold mb-4">
					{orderDetails.productName}
				</h2>
				<div className="flex items-center justify-between mb-4">
					<span className="text-gray-600">{t("order_id")}</span>
					<span className="font-mono">{orderId}</span>
				</div>
				<div className="flex items-center justify-between mb-4">
					<span className="text-gray-600">{t("order_date")}</span>
					<span>{new Date(orderItem.order.createdAt).toLocaleDateString()}</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-gray-600">{t("total_amount")}</span>
					<span className="text-lg font-semibold text-green-600">
						{orderDetails.totalPrice}
					</span>
				</div>
			</div>

			{/* Buyer Information Card */}
			<div className="bg-white rounded-lg p-6 mb-6">
				<h2 className="text-lg font-semibold mb-4">{t("buyer_information")}</h2>
				<div className="space-y-4">
					<div className="flex items-start">
						<UserIcon className="w-6 h-6 text-gray-400 mr-3" />
						<div>
							<p className="font-medium">
								{orderItem.order.user?.name ?? t("unknown_buyer")}
							</p>
							<p className="text-sm text-gray-500">{orderItem.order.user?.email}</p>
						</div>
					</div>
					<div className="flex items-start">
						<MapPinIcon className="w-6 h-6 text-gray-400 mr-3" />
						<div>
							<p className="font-medium">{t("delivery_address")}</p>
							<p className="text-sm text-gray-500">
								{orderDetails.address || t("no_address_provided")}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Product Details Card */}
			<div className="bg-white rounded-lg p-6">
				<ProductStatusDetails
					productDetails={orderDetails}
					isProducer={isProducer}
				/>
			</div>
		</ProfileOptionLayout>
	);
}
