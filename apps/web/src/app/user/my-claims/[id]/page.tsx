"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ProductStatusDetails from "~/app/_components/features/ProductStatusDetails";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";

type SaleDetails = {
	productName: string;
	status: string;
	roast: string;
	type: string;
	quantity: string;
	delivery: string;
	totalPrice: string;
	address?: string;
};

export default function MySaleDetails() {
	const { id: saleId } = useParams();
	const { t } = useTranslation();

	const [saleDetails, setSaleDetails] = useState<SaleDetails | null>(null);
	// TODO: Fetch user role based on user id or from session/context/token
	const [isProducer, setIsProducer] = useState<boolean>(false);

	useEffect(() => {
		// TODO: Fetch sale details based on saleId
		if (saleId) {
			setSaleDetails({
				productName: t("product_name"),
				status: t("order_status.delivered"),
				roast: t("roast.strong"),
				type: t("coffee_type.grounded"),
				quantity: t("quantity_with_unit", { count: 5, unit: t("bags") }),
				delivery: t("delivery_method.meetup"),
				totalPrice: t("price_with_currency", { price: 50, currency: "USD" }),
			});
		}

		// TODO: Fetch user role based on user id or from session/context/token
		setIsProducer(true);
	}, [saleId, t]);

	const updateSaleDetails = (productDetails: SaleDetails) => {
		// TODO: Implement logic to update sale details
		setSaleDetails(productDetails);
	};

	return (
		<ProfileOptionLayout
			title={saleDetails?.productName ?? ""}
			backLink="/user/my-sales"
		>
			{saleDetails && (
				<ProductStatusDetails
					productDetails={saleDetails}
					isProducer={isProducer}
					updateProductDetails={updateSaleDetails}
				/>
			)}
		</ProfileOptionLayout>
	);
}
