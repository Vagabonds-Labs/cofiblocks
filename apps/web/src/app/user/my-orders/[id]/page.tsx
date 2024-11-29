"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ProductStatusDetails from "~/app/_components/features/ProductStatusDetails";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";

type OrderDetails = {
	productName: string;
	status: string;
	roast: string;
	type: string;
	quantity: string;
	delivery: string;
	totalPrice: string;
	address?: string;
};

export default function OrderDetails() {
	const { t } = useTranslation();
	const { id: orderId } = useParams();

	const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
	// TODO: Fetch user role based on user id or from session/context/token
	const [isProducer, setIsProducer] = useState<boolean>(false);

	useEffect(() => {
		// TODO: Fetch order details based on orderId
		if (orderId) {
			setOrderDetails({
				productName: t("sample_product"),
				status: t("paid"),
				roast: t("strong"),
				type: t("grounded"),
				quantity: `5 ${t("bags")}`,
				delivery: t("delivery"),
				address: "Av Portugal 375, ap 410 São Paulo/SP CEP 66010-100",
				totalPrice: `50 ${t("usd")}`,
			});
		}

		// TODO: Fetch user role based on user id or from session/context/token
		setIsProducer(true);
	}, [orderId, t]);

	const updateProductDetails = (productDetails: OrderDetails) => {
		// TODO: Implement logic to update order details
		setOrderDetails(productDetails);
	};

	return (
		<ProfileOptionLayout
			title={orderDetails?.productName ?? ""}
			backLink="/user/my-orders"
		>
			{orderDetails && (
				<ProductStatusDetails
					productDetails={orderDetails}
					isProducer={isProducer}
					updateProductDetails={updateProductDetails}
				/>
			)}
		</ProfileOptionLayout>
	);
}
