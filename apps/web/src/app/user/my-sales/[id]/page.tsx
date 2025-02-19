"use client";

import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import ProductStatusDetails from "~/app/_components/features/ProductStatusDetails";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import type { SaleDetailsType } from "~/types";

export default function SaleDetails() {
	const { id: saleId } = useParams();
	const { data: session } = useSession();

	const [saleDetails, setSaleDetails] = useState<SaleDetailsType | null>(null);
	const isProducer = session?.user?.role === "COFFEE_PRODUCER";

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
	}, [saleId]);

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
