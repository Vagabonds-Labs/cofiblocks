"use client";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useAccount } from "@starknet-react/core";
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
	const { address } = useAccount();

	const [state, dispatch] = useReducer(CheckoutReducer, initialState);
	const [isLoading, setIsLoading] = useState(false);

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

	const handleCurrencySelect = (currency: string) => {
		setIsLoading(true);
		// Simulate API call or blockchain transaction
		setTimeout(() => {
			dispatch({ type: "SET_CURRENCY", payload: currency });
			dispatch({ type: "CONFIRM_ORDER" });
			setIsLoading(false);
		}, 2000);
	};

	const deliveryPrice = state.deliveryLocation === "gam" ? 20 : 40;

	if (!address) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p className="text-lg">{t("connect_wallet_to_checkout")}</p>
			</div>
		);
	}

	return (
		<div className="max-w-md mx-auto bg-white min-h-screen">
			<Link href="/shopping-cart">
				<div className="flex items-center gap-2 p-3 rounded-lg mb-6">
					<ArrowLeftIcon className="h-5 w-5" />
					<span className="text-xl">{t("my_cart")}</span>
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
							onNext={handleNextStep}
							deliveryAddress={state.deliveryAddress}
							deliveryMethod={state.deliveryMethod}
							deliveryPrice={deliveryPrice}
							onCurrencySelect={handleCurrencySelect}
							isConfirmed={state.isConfirmed}
						/>
					)}
				</>
			)}
		</div>
	);
}
