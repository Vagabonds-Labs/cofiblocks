"use client";

import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import React from "react";
import { useTranslation } from "react-i18next";
import ProductStatusDetails from "~/app/_components/features/ProductStatusDetails";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import { CoffeeIcon } from "~/app/_components/icons/CoffeeIcon";
import { api } from "~/trpc/react";

interface RawMetadata {
	roast?: unknown;
}

const parseMetadata = (metadata: string | null): { roast: string } => {
	try {
		let parsed: RawMetadata = {};
		try {
			const rawResult = JSON.parse(metadata ?? "{}") as unknown;
			if (
				rawResult &&
				typeof rawResult === "object" &&
				!Array.isArray(rawResult)
			) {
				const result = rawResult as Record<string, unknown>;
				parsed = {
					roast: result.roast,
				};
			}
		} catch {
			// If JSON parsing fails, use empty object
		}

		return {
			roast: typeof parsed.roast === "string" ? parsed.roast : "unknown",
		};
	} catch {
		return {
			roast: "unknown",
		};
	}
};

export default function OrderDetails() {
	const { t } = useTranslation();
	const { id: orderId } = useParams();
	const { data: session } = useSession();
	const user_session = session?.user;
	const isAuthenticated = !!user_session;
	// Temporarily assume user is not a producer since CavosUser doesn't have a role property
	const isProducer = false; // Will need to be updated when role information is available from Cavos

	const { data: user } = api.user.getUser.useQuery(
		{ userId: user_session?.id ?? "" },
		{
			enabled: isAuthenticated && !!user_session?.id,
		},
	);

	const { data: order, isLoading } = api.order.getOrder.useQuery(
		{ orderId: orderId as string },
		{
			enabled: !!orderId,
		},
	);

	if (isLoading) {
		return (
			<ProfileOptionLayout title="" backLink="/user/my-orders">
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

	if (!order) {
		return (
			<ProfileOptionLayout title="" backLink="/user/my-orders">
				<div className="text-center py-8">
					<p className="text-gray-600">{t("order_not_found")}</p>
				</div>
			</ProfileOptionLayout>
		);
	}

	const orderDetails = {
		productName: order.items[0]?.product.name ?? t("unknown_product"),
		status: order.status,
		roast: order.items[0]?.product.nftMetadata
			? parseMetadata(order.items[0]?.product.nftMetadata as string).roast
			: t("unknown_roast"),
		type: t("grounded"),
		quantity: `${order.items[0]?.quantity ?? 0} ${t("bags")}`,
		delivery: t("delivery"),
		address: user?.physicalAddress ?? "",
		totalPrice: `${(order.items[0]?.price ?? 0) * (order.items[0]?.quantity ?? 0)} ${t("usd")}`,
	};

	return (
		<ProfileOptionLayout
			title={orderDetails.productName}
			backLink="/user/my-orders"
		>
			{/* Status Banner - Most important info for customers */}
			<div className="bg-surface-primary-soft rounded-lg p-6 mb-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-semibold">{t("status")}</h2>
					<span className="px-4 py-2 bg-white rounded-full text-sm font-medium">
						{t(`order_status.${orderDetails.status.toLowerCase()}`)}
					</span>
				</div>
				<p className="text-gray-600">
					{t(`order_status_message.${orderDetails.status.toLowerCase()}`)}
				</p>
			</div>

			{/* Product Experience Card */}
			<div className="bg-white rounded-lg p-6 mb-6">
				<div className="flex items-start space-x-4">
					<div className="bg-surface-primary-soft p-4 rounded-lg">
						<CoffeeIcon className="w-8 h-8 text-primary" />
					</div>
					<div className="flex-1">
						<h3 className="text-lg font-medium mb-2">{t("your_coffee")}</h3>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-sm text-gray-500">{t("roast")}</p>
								<p className="font-medium">{orderDetails.roast}</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">{t("quantity")}</p>
								<p className="font-medium">{orderDetails.quantity}</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">{t("type")}</p>
								<p className="font-medium">{orderDetails.type}</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">{t("total")}</p>
								<p className="font-medium">{orderDetails.totalPrice}</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Delivery Information - Only if there's an address */}
			{orderDetails.address && (
				<div className="bg-white rounded-lg p-6">
					<h3 className="text-lg font-medium mb-4">
						{t("delivery_information")}
					</h3>
					<div className="bg-surface-primary-soft rounded-lg p-4">
						<p className="text-sm text-gray-600 mb-2">{t("shipping_to")}</p>
						<p className="font-medium">{orderDetails.address}</p>
					</div>
				</div>
			)}

			{/* Hidden ProductStatusDetails for maintaining functionality */}
			<div className="hidden">
				<ProductStatusDetails
					productDetails={orderDetails}
					isProducer={isProducer}
				/>
			</div>
		</ProfileOptionLayout>
	);
}
