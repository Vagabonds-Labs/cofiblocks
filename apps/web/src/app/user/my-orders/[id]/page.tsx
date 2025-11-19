"use client";

import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import React from "react";
import { useTranslation } from "react-i18next";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import { CoffeeIcon } from "~/app/_components/icons/CoffeeIcon";
import { api } from "~/trpc/react";

interface RawMetadata {
	roast?: unknown;
	strength?: unknown;
}

const parseMetadata = (metadata: string | null, t: (key: string) => string): { roast: string } => {
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
					strength: result.strength,
				};
			}
		} catch {
			// If JSON parsing fails, use empty object
		}

		// Try to get roast from either 'roast' or 'strength' field
		const roastValue = parsed.roast || parsed.strength;
		const roast = typeof roastValue === "string" ? roastValue : t("unknown_roast");
		return {
			roast,
		};
	} catch {
		return {
			roast: t("unknown_roast"),
		};
	}
};

export default function OrderDetails() {
	const { t } = useTranslation();
	const { id: orderId } = useParams();
	const { data: session } = useSession();
	const user_session = session?.user;
	const isAuthenticated = !!user_session;

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

	const totalPrice = order.items.reduce((sum, item) => {
		return sum + (item.price ?? 0) * (item.quantity ?? 0);
	}, 0);

	return (
		<ProfileOptionLayout
			title={t("order_details")}
			backLink="/user/my-orders"
		>
			{/* Status Banner - Most important info for customers */}
			<div className="bg-surface-primary-soft rounded-lg p-6 mb-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-semibold">{t("status")}</h2>
					<span className="px-4 py-2 bg-white rounded-full text-sm font-medium">
						{t(`order_status.${order.status.toLowerCase()}`)}
					</span>
				</div>
				<p className="text-gray-600">
					{t(`order_status_message.${order.status.toLowerCase()}`)}
				</p>
			</div>

			{/* Order Items List */}
			<div className="space-y-4 mb-6">
				<h3 className="text-lg font-medium mb-4">{t("order_items")}</h3>
				{order.items.map((item) => {
					const roast = item.product.nftMetadata
						? parseMetadata(item.product.nftMetadata as string, t).roast
						: t("unknown_roast");
					const itemTotal = (item.price ?? 0) * (item.quantity ?? 0);

					return (
						<div key={item.id} className="bg-white rounded-lg p-6">
							<div className="flex items-start space-x-4">
								<div className="bg-surface-primary-soft p-4 rounded-lg">
									<CoffeeIcon className="w-8 h-8 text-primary" />
								</div>
								<div className="flex-1">
									<h4 className="text-lg font-medium mb-2">
										{item.product.name ?? t("unknown_product")}
									</h4>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<p className="text-sm text-gray-500">{t("roast")}</p>
											<p className="font-medium">{roast}</p>
										</div>
										<div>
											<p className="text-sm text-gray-500">{t("quantity")}</p>
											<p className="font-medium">
												{item.quantity ?? 0} {t("bags")}
											</p>
										</div>
										<div>
											<p className="text-sm text-gray-500">{t("type")}</p>
											<p className="font-medium">{t("grounded")}</p>
										</div>
										<div>
											<p className="text-sm text-gray-500">{t("price")}</p>
											<p className="font-medium">
												{itemTotal} {t("usd")}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Order Total */}
			<div className="bg-white rounded-lg p-6 mb-6">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-medium">{t("order_total")}</h3>
					<p className="text-xl font-semibold">
						{totalPrice} {t("usd")}
					</p>
				</div>
			</div>

			{/* Delivery Information - Only if there's an address */}
			{user?.physicalAddress && (
				<div className="bg-white rounded-lg p-6">
					<h3 className="text-lg font-medium mb-4">
						{t("delivery_information")}
					</h3>
					<div className="bg-surface-primary-soft rounded-lg p-4">
						<p className="text-sm text-gray-600 mb-2">{t("shipping_to")}</p>
						<p className="font-medium">{user.physicalAddress}</p>
					</div>
				</div>
			)}
		</ProfileOptionLayout>
	);
}
