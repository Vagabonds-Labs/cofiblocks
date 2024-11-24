"use client";

import { useAccount, useDisconnect } from "@starknet-react/core";
import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import SearchBar from "~/app/_components/features/SearchBar";
import DeliveryMethod from "~/app/_components/features/checkout/Deliverymethod";
import LocationSelector from "~/app/_components/features/checkout/LocationSelector";
import Header from "~/app/_components/layout/Header";

export default function CheckoutPage() {
	const { t } = useTranslation();
	const { address } = useAccount();
	const { disconnect } = useDisconnect();
	const [isLoading, setIsLoading] = useState(false);
	const [checkoutStep, setCheckoutStep] = useState("delivery");

	const handleNextStep = () => {
		if (checkoutStep === "delivery") {
			setCheckoutStep("location");
			return;
		}
		if (checkoutStep === "location") {
			setIsLoading(true);
			setTimeout(() => {
				setIsLoading(false);
				setCheckoutStep("payment");
			}, 1000);
		}
	};
	return (
		<div className="max-w-md mx-auto bg-white min-h-screen">
			<Header address={address} disconnect={disconnect} showCart={true} />
			<SearchBar />

			{isLoading ? (
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900" />
				</div>
			) : (
				<>
					{checkoutStep === "delivery" && (
						<DeliveryMethod onNext={handleNextStep} />
					)}

					{checkoutStep === "location" && (
						<LocationSelector
							onNext={() => {
								handleNextStep();
							}}
						/>
					)}

					{checkoutStep === "payment" && (
						<div className="flex flex-col justify-center items-center p-4">
							<div>
								<Image
									src="/images/PaymentConfirmation.png"
									width={700}
									height={700}
									alt="Payment confirmation"
								/>
							</div>
							<div className="text-center mt-4">
								<h2 className="text-2xl font-bold mb-2">
									{t("payment_confirmed")}
								</h2>
								<p>{t("thank_you_for_your_purchase")}</p>
							</div>
							<div className="flex justify-center mt-4">
								<button
									type="button"
									onClick={() => setCheckoutStep("delivery")}
									className="w-full p-4 bg-yellow-400 rounded-lg text-center font-medium"
								>
									{t("return_to_delivery")}
								</button>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}
