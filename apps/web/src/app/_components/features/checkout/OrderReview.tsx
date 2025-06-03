"use client";

import { ArrowDownIcon } from "@heroicons/react/24/outline";
import Button from "@repo/ui/button";
import { Separator } from "@repo/ui/separator";
import { useAccount, useProvider } from "@starknet-react/core";
import { useAtomValue, useSetAtom } from "jotai";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	ContractsInterface,
	useCofiCollectionContract,
	useMarketplaceContract,
	useStarkContract,
} from "~/services/contractsInterface";
import { useCreateOrder } from "~/services/useCreateOrder";
import { cartItemsAtom, clearCartAtom, isCartOpenAtom } from "~/store/cartAtom";
import type { CartItem } from "~/store/cartAtom";
import { api } from "~/trpc/react";
import Confirmation from "./Confirmation";
import { CurrencySelector } from "./CurrencySelector";

const getImageUrl = (src: string) => {
	if (src.startsWith("Qm")) {
		return `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${src}`;
	}
	if (src.startsWith("ipfs://")) {
		return `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${src.replace("ipfs://", "")}`;
	}
	if (
		src.startsWith("http://") ||
		src.startsWith("https://") ||
		src.startsWith("/")
	) {
		return src;
	}
	return "/images/cafe1.webp"; // Fallback image
};

interface OrderReviewProps {
	readonly onCurrencySelect: (currency: string) => void;
	readonly deliveryAddress: {
		readonly street: string;
		readonly apartment: string;
		readonly city: string;
		readonly zipCode: string;
	};
	readonly deliveryPrice: number;
	readonly isConfirmed: boolean;
}

const MARKET_FEE_BPS = 5000; // 50%

export default function OrderReview({
	onCurrencySelect,
	deliveryAddress,
	deliveryPrice,
	isConfirmed,
}: OrderReviewProps) {
	const { t } = useTranslation();
	const cartItems = useAtomValue(cartItemsAtom);
	const clearCart = useSetAtom(clearCartAtom);
	const setIsCartOpen = useSetAtom(isCartOpenAtom);
	const [isCurrencySelectorOpen, setIsCurrencySelectorOpen] = useState(false);
	const [selectedCurrency, setSelectedCurrency] = useState("USD");
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	const createOrder = useCreateOrder();

	const account = useAccount();
	const { provider } = useProvider();
	const contract = new ContractsInterface(
		account,
		useCofiCollectionContract(),
		useMarketplaceContract(),
		useStarkContract(),
		provider,
	);

	const { data: cart } = api.cart.getUserCart.useQuery();

	const productPrice = cartItems.reduce(
		(total, item) => total + item.price * item.quantity,
		0,
	);
	const platformFee = (productPrice * MARKET_FEE_BPS) / 10000;
	const totalPrice = productPrice + platformFee + deliveryPrice;

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

			console.log("Attempting mock purchase with:", {
				token_ids,
				token_amounts,
				totalPrice,
			});
			// Original contract call (commented out)
			// await contract.buy_product(token_ids, token_amounts, totalPrice);

			// SIMULATE SUCCESS FOR NOW - REPLACE WITH PIN LOGIC
			await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate delay
			console.log("Mock purchase simulation complete.");

			if (!cart?.id) {
				throw new Error("Cart not found");
			}

			await createOrder.mutateAsync({ cartId: cart.id });
			clearCart();
			setIsCartOpen(false);
			setShowConfirmation(true);
			router.push("/user/my-orders");
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
								src={getImageUrl(item.imageUrl)}
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
								<div className="flex flex-col items-end">
									<span className="text-sm text-gray-500">
										{(item.price * item.quantity).toFixed(2)} {selectedCurrency}
									</span>
									<span className="font-medium">
										{(
											item.price *
											(1 + MARKET_FEE_BPS / 10000) *
											item.quantity
										).toFixed(2)}{" "}
										{selectedCurrency}
									</span>
								</div>
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
						<span className="text-gray-600">{t("subtotal")}</span>
						<span>
							{productPrice.toFixed(2)} {selectedCurrency}
						</span>
					</div>
					<Separator />

					<div className="flex justify-between py-2">
						<span className="text-gray-600">{t("operating_fee")} (50%)</span>
						<span>
							+{platformFee.toFixed(2)} {selectedCurrency}
						</span>
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
						<span className="font-medium text-lg">{t("total_price")}</span>
						<div className="flex flex-col items-end gap-1">
							<div className="flex items-center gap-2">
								<span className="font-bold text-lg">
									{totalPrice.toFixed(2)} {selectedCurrency}
								</span>
								<ArrowDownIcon className="h-4 w-4 text-yellow-500" />
							</div>
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
					disabled={isProcessing || cartItems.length === 0}
				>
					{t("change_currency")}
				</Button>

				<Button
					onClick={handleProceedToPayment}
					className={`w-full bg-yellow-400 hover:bg-yellow-500 text-black mt-6 h-14 ${cartItems.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
					disabled={isProcessing || cartItems.length === 0}
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
