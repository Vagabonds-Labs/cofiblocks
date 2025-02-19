"use client";

import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import React from "react";
import { useTranslation } from "react-i18next";
import ProductStatusDetails from "~/app/_components/features/ProductStatusDetails";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import { api } from "~/trpc/react";

interface RawMetadata {
	roast?: unknown;
}

const parseMetadata = (metadata: string | null): { roast: string } => {
	try {
		let parsed: RawMetadata = {};
		try {
			// Use type assertion for the initial parse result
			const rawResult = JSON.parse(metadata ?? "{}") as unknown;
			// Type guard to ensure we have an object
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
	const isProducer = session?.user?.role === "COFFEE_PRODUCER";
	const userId = session?.user?.id;

	const { data: user } = api.user.getUser.useQuery(
		{ userId: userId ?? "" },
		{
			enabled: !!userId,
		},
	);

	const { data: order, isLoading } = api.order.getOrder.useQuery(
		{ orderId: orderId as string },
		{
			enabled: !!orderId,
		},
	);

	const orderDetails = order
		? {
				productName: order.items[0]?.product.name ?? t("unknown_product"),
				status: order.status,
				roast: order.items[0]?.product.nftMetadata
					? parseMetadata(order.items[0].product.nftMetadata as string).roast
					: t("unknown_roast"),
				type: t("grounded"), // TODO: Add type to product metadata
				quantity: `${order.items[0]?.quantity ?? 0} ${t("bags")}`,
				delivery: t("delivery"), // TODO: Add delivery method to order
				address: user?.physicalAddress ?? "",
				totalPrice: `${order.total} ${t("usd")}`,
			}
		: null;

	return (
		<ProfileOptionLayout
			title={orderDetails?.productName ?? ""}
			backLink="/user/my-orders"
		>
			{isLoading ? (
				<div className="space-y-4">
					<div className="animate-pulse h-6 bg-gray-200 rounded w-1/4" />
					<div className="space-y-2">
						<div className="animate-pulse h-20 bg-gray-200 rounded" />
						<div className="animate-pulse h-20 bg-gray-200 rounded" />
					</div>
				</div>
			) : orderDetails ? (
				<ProductStatusDetails
					productDetails={orderDetails}
					isProducer={isProducer}
				/>
			) : (
				<div className="text-center py-8">
					<p className="text-gray-600">{t("order_not_found")}</p>
				</div>
			)}
		</ProfileOptionLayout>
	);
}
