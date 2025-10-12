"use client";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";;
import Link from "next/link";
import { useReducer } from "react";
import { useTranslation } from "react-i18next";
import {
	CheckoutReducer,
	initialState,
} from "~/app/_components/features/checkout/CheckoutReducer";
import DeliveryAddress from "~/app/_components/features/checkout/DeliveryAddress";
import DeliveryMethod from "~/app/_components/features/checkout/Deliverymethod";
import OrderReview from "~/app/_components/features/checkout/OrderReview";

export default function CheckoutPage() {
	const { t } = useTranslation();
	const [state, dispatch] = useReducer(CheckoutReducer, initialState);

	const handleNextStep = (method: string, price: number, location?: string) => {
		if (state.checkoutStep === "delivery") {
			dispatch({ type: "SET_DELIVERY_METHOD", payload: method });
			dispatch({ type: "SET_DELIVERY_PRICE", payload: price });
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
		dispatch({ type: "SET_CURRENCY", payload: currency });
	};

	return (
		<div className="max-w-md mx-auto bg-white min-h-screen">
			<Link href="/shopping-cart">
				<div className="flex items-center gap-2 p-3 rounded-lg mb-6">
					<ArrowLeftIcon className="h-5 w-5" />
					<span className="text-xl">{t("shopping_cart_title")}</span>
				</div>
			</Link>
			{state.checkoutStep === "delivery" && (
				<DeliveryMethod onNext={handleNextStep} />
			)}
			{state.checkoutStep === "address" && (
				<DeliveryAddress onNext={handleAddressSubmit} />
			)}
			{state.checkoutStep === "review" && (
				<OrderReview
					onCurrencySelect={handleCurrencySelect}
					deliveryAddress={state.deliveryAddress}
					deliveryMethod={state.deliveryMethod}
					isConfirmed={state.isConfirmed}
				/>
			)}
		</div>
	);
}
