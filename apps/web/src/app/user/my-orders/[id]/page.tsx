"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import ProductStatusDetails from "~/app/_components/features/ProductStatusDetails";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import type { OrderDetailsType } from "~/types";

export default function OrderDetails() {
	const { id: orderId } = useParams();

	const [orderDetails, setOrderDetails] = useState<OrderDetailsType | null>(
		null,
	);
	// TODO: Fetch user role based on user id or from session/context/token
	const [isProducer, setIsProducer] = useState<boolean>(false);

	useEffect(() => {
		// TODO: Fetch order details based on orderId
		if (orderId) {
			setOrderDetails({
				productName: "Sample Product",
				status: "Paid",
				roast: "strong",
				type: "grounded",
				quantity: "5 bags",
				delivery: "Delivery",
				address: "Av Portugal 375, ap 410 São Paulo/SP CEP 66010-100",
				totalPrice: "50 USD",
			});
		}

		// TODO: Fetch user role based on user id or from session/context/token
		setIsProducer(true);
	}, [orderId]);

	const updateProductDetails = (productDetails: OrderDetailsType) => {
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
