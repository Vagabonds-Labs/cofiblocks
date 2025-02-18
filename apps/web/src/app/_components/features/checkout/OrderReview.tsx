"use client";

import { ArrowDownIcon } from "@heroicons/react/24/outline";
import Button from "@repo/ui/button";
import { Separator } from "@repo/ui/separator";
import { useAccount, useProvider } from "@starknet-react/core";
import { useAtomValue, useSetAtom } from "jotai";
import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	ContractsInterface,
	useCofiCollectionContract,
	useMarketplaceContract,
	useStarkContract,
} from "~/services/contractsInterface";
import { cartItemsAtom, clearCartAtom } from "~/store/cartAtom";
import type { CartItem } from "~/store/cartAtom";
import Confirmation from "./Confirmation";
import { CurrencySelector } from "./CurrencySelector";

interface OrderReviewProps {
	readonly onNext: () => void;
	readonly onCurrencySelect: (currency: string) => void;
	readonly deliveryAddress: {
		readonly street: string;
		readonly apartment: string;
		readonly city: string;
		readonly zipCode: string;
	};
	readonly deliveryMethod: string;
	readonly deliveryPrice: number;
	readonly isConfirmed: boolean;
}

export default function OrderReview({
	onNext,
	onCurrencySelect,
	deliveryAddress,
	deliveryMethod,
	deliveryPrice,
	isConfirmed,
}: OrderReviewProps) {
	const { t } = useTranslation();
	const cartItems = useAtomValue(cartItemsAtom);
	const clearCart = useSetAtom(clearCartAtom);
	const [isCurrencySelectorOpen, setIsCurrencySelectorOpen] = useState(false);
	const [selectedCurrency, setSelectedCurrency] = useState("USD");
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const account = useAccount();
	const { provider } = useProvider();
	const contract = new ContractsInterface(
		account,
		useCofiCollectionContract(),
		useMarketplaceContract(),
		useStarkContract(),
		provider,
	);

	const productPrice = cartItems.reduce(
		(total, item) => total + item.price * item.quantity,
		0,
	);
	const totalPrice = productPrice + deliveryPrice;

	const handleCurrencySelect = (currency: string) => {
		setSelectedCurrency(currency);
		setIsCurrencySelectorOpen(false);
		onCurrencySelect(currency);
	};

	const handleProceedToPayment = async () => {
		try {
			setIsProcessing(true);
			setError(null);

			const token_ids = cartItems.map((item) => item.tokenId);
			const token_amounts = cartItems.map((item) => item.quantity);

			// Execute the purchase transaction
			const tx_hash = await contract.buy_product(
				token_ids,
				token_amounts,
				totalPrice,
			);

			// Clear the cart after successful purchase
			clearCart();

			// Show confirmation
			setShowConfirmation(true);
			onNext();
		} catch (err) {
			console.error("Payment error:", err);
			setError(
				err instanceof Error ? err.message : "Failed to process payment",
			);
		} finally {
			setIsProcessing(false);
		}
	};

	if (showConfirmation || isConfirmed) {
		return <Confirmation />;
	}

	return (
		<div className="min-h-screen bg-white">
			<div className="p-4">
				<h1 className="text-xl font-medium mb-6">{t("review_your_order")}</h1>

				{cartItems.map((item: CartItem) => (
					<div key={item.id} className="space-y-6 mb-6">
						<div className="flex items-start gap-4">
							<Image
								src={item.imageUrl}
								alt={item.name}
								width={80}
								height={80}
								className="rounded-lg object-cover bg-gray-100"
							/>
							<span className="text-lg">{item.name}</span>
						</div>

						<div className="space-y-4">
							<div className="flex justify-between py-2">
								<span className="text-gray-600">{t("quantity")}</span>
								<span>
									{item.quantity} {t("bags")}
								</span>
							</div>
							<Separator />

							<div className="flex justify-between py-2">
								<span className="text-gray-600">{t("product_price")}</span>
								<span>
									{(item.price * item.quantity).toFixed(2)} {selectedCurrency}
								</span>
							</div>
							<Separator />
						</div>
					</div>
				))}

				<div className="space-y-4 mt-6">
					<div className="flex justify-between py-2">
						<span className="text-gray-600">{t("delivery_address")}</span>
						<div className="text-right">
							<span className="block font-medium">{t("my_home")}</span>
							<span className="block text-sm text-gray-500">
								{deliveryAddress.street}, {deliveryAddress.apartment}
							</span>
							<span className="block text-sm text-gray-500">
								{deliveryAddress.city} {deliveryAddress.zipCode}
							</span>
						</div>
					</div>
					<Separator />

					<div className="flex justify-between py-2">
						<span className="text-gray-600">{t("delivery_price")}</span>
						<span>
							+{deliveryPrice.toFixed(2)} {selectedCurrency}
						</span>
					</div>
					<Separator />

					<div className="flex justify-between items-center py-2">
						<span className="text-gray-600">{t("total_price")}</span>
						<div className="flex items-center gap-2">
							<span>
								{totalPrice.toFixed(2)} {selectedCurrency}
							</span>
							<ArrowDownIcon className="h-4 w-4 text-yellow-500" />
						</div>
					</div>
				</div>

				{error && (
					<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
						{error}
					</div>
				)}

				<Button
					onClick={() => setIsCurrencySelectorOpen(true)}
					className="w-full bg-white border border-gray-300 text-black mt-6 h-14"
					disabled={isProcessing}
				>
					{t("change_currency")}
				</Button>

				<Button
					onClick={handleProceedToPayment}
					className="w-full bg-yellow-400 hover:bg-yellow-500 text-black mt-6 h-14"
					disabled={isProcessing}
				>
					{isProcessing ? t("processing_payment") : t("proceed_to_payment")}
				</Button>
			</div>

			<CurrencySelector
				isOpen={isCurrencySelectorOpen}
				onClose={() => setIsCurrencySelectorOpen(false)}
				onSelect={handleCurrencySelect}
			/>
		</div>
	);
}
