"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
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

export default function SaleDetails() {
	const { id: saleId } = useParams();

	const [saleDetails, setSaleDetails] = useState<SaleDetails | null>(null);
	// TODO: Fetch user role based on user id or from session/context/token
	const [isProducer, setIsProducer] = useState<boolean>(false);

	useEffect(() => {
		// TODO: Fetch sale details based on saleId
		if (saleId) {
			setSaleDetails({
				productName: "Product Name",
				status: "Prepared",
				roast: "strong",
				type: "grounded",
				quantity: "5 bags",
				delivery: "Meetup",
				totalPrice: "50 USD",
			});
		}

		// TODO: Fetch user role based on user id or from session/context/token
		setIsProducer(true);
	}, [saleId]);

	const updateSaleDetails = (productDetails: SaleDetails) => {
		// TODO: Implement logic to update sale details
		setSaleDetails(productDetails);
	};

	return (
		<ProfileOptionLayout
			title={saleDetails?.productName || ""}
			backLink="/user/my-sales"
		>
			<ProductStatusDetails
				productDetails={saleDetails as SaleDetails}
				isProducer={isProducer}
				updateProductDetails={updateSaleDetails}
			/>
		</ProfileOptionLayout>
	);
}
