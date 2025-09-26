"use client";

import type { OrderStatus } from "@prisma/client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ProductStatusDetails from "~/app/_components/features/ProductStatusDetails";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import { useCavosAuth } from "~/providers/cavos-auth";
import type { SaleDetailsType } from "~/types";

export default function MySaleDetails() {
	const { id: saleId } = useParams();
	const { t } = useTranslation();
	const { user: cavosUser } = useCavosAuth();

	const [saleDetails, setSaleDetails] = useState<SaleDetailsType | null>(null);
	// Temporarily assume user is not a producer since CavosUser doesn't have a role property
	const isProducer = false; // Will need to be updated when role information is available from Cavos

	useEffect(() => {
		// TODO: Fetch sale details based on saleId
		if (saleId) {
			setSaleDetails({
				productName: t("product_name"),
				status: "COMPLETED" as OrderStatus,
				roast: t("roast.strong"),
				type: t("coffee_type.grounded"),
				quantity: t("quantity_with_unit", { count: 5, unit: t("bags") }),
				delivery: t("delivery_method.meetup"),
				totalPrice: t("price_with_currency", { price: 50, currency: "USD" }),
			});
		}
	}, [saleId, t]);

	const updateSaleDetails = (productDetails: SaleDetailsType) => {
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
