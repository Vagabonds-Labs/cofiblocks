"use client";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Button from "@repo/ui/button";
import { useAccount } from "@starknet-react/core";
import Image from "next/image";
import Link from "next/link";
import { useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	CheckoutReducer,
	initialState,
} from "~/app/_components/features/checkout/CheckoutReducer";
import DeliveryAddress from "~/app/_components/features/checkout/DeliveryAddress";
import DeliveryMethod from "~/app/_components/features/checkout/DeliveryMethod";
import OrderReview from "~/app/_components/features/checkout/OrderReview";

export default function CheckoutPage() {
	const { t } = useTranslation();
	useAccount();

	const [state, dispatch] = useReducer(CheckoutReducer, initialState);
	const [isLoading] = useState(false);

	const handleNextStep = (method?: string, location?: string) => {
		if (state.checkoutStep === "delivery") {
			dispatch({ type: "SET_DELIVERY_METHOD", payload: method ?? "" });
			if (method === "home") {
				dispatch({ type: "SET_DELIVERY_LOCATION", payload: location ?? "" });
				dispatch({ type: "SET_STEP", payload: "address" });
			} else if (method === "meetup") {
				dispatch({ type: "SET_STEP", payload: "review" });
			}
		} else if (state.checkoutStep === "address") {
			dispatch({ type: "SET_STEP", payload: "review" });
		} else if (state.checkoutStep === "review") {
			dispatch({ type: "SET_STEP", payload: "payment" });
		}
	};

	const handleAddressSubmit = (addressData: {
		street: string;
		apartment: string;
		city: string;
		zipCode: string;
	}) => {
		dispatch({ type: "SET_DELIVERY_ADDRESS", payload: addressData });
		dispatch({ type: "SET_STEP", payload: "review" });
	};

	const deliveryPrice = state.deliveryLocation === "gam" ? 20 : 40;

	return (
		<div className="max-w-md mx-auto bg-white min-h-screen">
			<Link href="/shopping-cart">
				<div className="flex items-center gap-2 p-3 rounded-lg mb-6">
					<ArrowLeftIcon className="h-5 w-5" />
					<span className="text-xl">My Cart</span>
				</div>
			</Link>
			{isLoading ? (
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900" />
				</div>
			) : (
				<>
					{state.checkoutStep === "delivery" && (
						<DeliveryMethod onNext={handleNextStep} />
					)}

					{state.checkoutStep === "address" && (
						<DeliveryAddress onNext={handleAddressSubmit} />
					)}

					{state.checkoutStep === "review" && (
						<OrderReview
							onNext={() => handleNextStep()}
							deliveryAddress={state.deliveryAddress}
							deliveryMethod={state.deliveryMethod}
							deliveryPrice={deliveryPrice}
						/>
					)}

					{state.checkoutStep === "payment" && (
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
								<Button
									onClick={() =>
										dispatch({ type: "SET_STEP", payload: "delivery" })
									}
									className="w-full p-4 bg-yellow-400 rounded-lg text-center font-medium"
								>
									{t("return_to_delivery")}
								</Button>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}
