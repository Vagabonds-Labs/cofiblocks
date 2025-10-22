"use client";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";;
import Link from "next/link";
import { useReducer } from "react";
import { useTranslation } from "react-i18next";
import { useAtomValue } from "jotai";
import {
	CheckoutReducer,
	initialState,
} from "~/app/_components/features/checkout/CheckoutReducer";
import DeliveryAddress from "~/app/_components/features/checkout/DeliveryAddress";
import DeliveryMethod from "~/app/_components/features/checkout/Deliverymethod";
import OrderReview from "~/app/_components/features/checkout/OrderReview";
import { cartItemsAtom, type CartItem } from "~/store/cartAtom";
import { api } from "~/trpc/react";

export default function CheckoutPage() {
	const { t } = useTranslation();
	const [state, dispatch] = useReducer(CheckoutReducer, initialState);
	const cartItems = useAtomValue(cartItemsAtom);

	// Get current cart
	api.cart.getUserCart.useQuery();

	// Calculate total package count from cart items
	const packageCount = cartItems.reduce((total: number, item: CartItem) => total + item.quantity, 0);

	// Calculate product price (simplified - using cart item prices directly)
	const productPrice = cartItems.reduce((total: number, item: CartItem) => total + (item.price * item.quantity), 0);

	const handleNextStep = (method: string, totalPrice: number, location?: string, deliveryPrice?: number) => {
		if (state.checkoutStep === "delivery") {
			dispatch({ type: "SET_DELIVERY_METHOD", payload: method });
			dispatch({ type: "SET_DELIVERY_PRICE", payload: deliveryPrice ?? 0 });
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
				<DeliveryMethod 
					onNext={handleNextStep} 
					productPrice={productPrice}
					packageCount={packageCount}
				/>
			)}
			{state.checkoutStep === "address" && (
				<DeliveryAddress onNext={handleAddressSubmit} />
			)}
			{state.checkoutStep === "review" && (
				<OrderReview
					onCurrencySelect={handleCurrencySelect}
					deliveryAddress={state.deliveryAddress}
					deliveryMethod={state.deliveryMethod}
					deliveryPrice={state.deliveryPrice}
					isConfirmed={state.isConfirmed}
				/>
			)}
		</div>
	);
}
