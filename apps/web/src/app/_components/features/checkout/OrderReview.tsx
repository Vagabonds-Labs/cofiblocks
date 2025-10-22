"use client";

import { ArrowDownIcon } from "@heroicons/react/24/outline";
import Button from "@repo/ui/button";
import { Separator } from "@repo/ui/separator";
import { useAtomValue, useSetAtom } from "jotai";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCreateOrder } from "~/services/useCreateOrder";
import { cartItemsAtom, clearCartAtom, isCartOpenAtom } from "~/store/cartAtom";
import type { CartItem } from "~/store/cartAtom";
import { api } from "~/trpc/react";
import Confirmation from "./Confirmation";
import { CurrencySelector } from "./CurrencySelector";
import type { PaymentToken } from "~/utils/contracts";

const getImageUrl = (src: string) => {
	const IPFS_GATEWAY_URL = "https://gateway.pinata.cloud/ipfs/";
	
	if (src.startsWith("Qm")) {
		return `${IPFS_GATEWAY_URL}${src}`;
	}
	if (src.startsWith("ipfs://")) {
		return `${IPFS_GATEWAY_URL}${src.replace("ipfs://", "")}`;
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
	readonly deliveryMethod: string;
	readonly deliveryPrice: number;
	readonly isConfirmed: boolean;
}

// const _MARKET_FEE_BPS = process.env.MARKET_FEE_BPS ? parseInt(process.env.MARKET_FEE_BPS) : 5000;

export default function OrderReview({
	onCurrencySelect,
	deliveryAddress,
	deliveryMethod,
	deliveryPrice,
	isConfirmed,
}: OrderReviewProps) {
	const { t } = useTranslation();
	const cartItems = useAtomValue(cartItemsAtom);
	const clearCart = useSetAtom(clearCartAtom);
	const setIsCartOpen = useSetAtom(isCartOpenAtom);
	const [isCurrencySelectorOpen, setIsCurrencySelectorOpen] = useState(false);
	const [selectedCurrency, setSelectedCurrency] = useState("USDC");
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	const createOrder = useCreateOrder();

	// Get current cart
	const { data: cart } = api.cart.getUserCart.useQuery();

	// Get unit prices for cart items
	const { data: priceData, isLoading: isLoadingPrices } = api.cart.getCartUnitPrices.useQuery(
		{
			cartId: cart?.id ?? "",
			paymentToken: selectedCurrency as "STRK" | "USDC" | "USDT",
		},
		{
			enabled: !!cart?.id && !!selectedCurrency,
		}
	);

	// Calculate total package count from cart items
	const totalPackageCount = cartItems.reduce((total, item) => total + item.quantity, 0);

	// Calculate prices using fetched unit prices or fallback to cart item prices
	const productPrice = cartItems.reduce((total, item) => {
		const unitPrice = priceData?.unitPrices?.[item.id] 
			? Number(priceData.unitPrices[item.id]) 
			: 0;
		return total + unitPrice * item.quantity;
	}, 0);

	api.order.getDeliveryFee.useQuery({
		province: deliveryAddress.city,
		packageCount: totalPackageCount,
	}, {
		enabled: !!deliveryAddress.city && deliveryMethod === "home",
	});

	// Use delivery price from checkout state, but validate with backend
	const deliveryAmount = deliveryMethod === "home" ? (deliveryPrice || 0) : 0;
	const totalPrice = productPrice + deliveryAmount;

	const handleCurrencySelect = (currency: string) => {
		setSelectedCurrency(currency.toUpperCase());
		setIsCurrencySelectorOpen(false);
		onCurrencySelect(currency.toUpperCase());
	};

	const handleProceedToPayment = async () => {
		try {
			setIsProcessing(true);
			setError(null);

			if (!cart?.id) {
				throw new Error("Cart not found");
			}

			// Create order in the database
			await createOrder.mutateAsync({
				cartId: cart.id, 
				paymentToken: selectedCurrency as PaymentToken,
				deliveryAddress: deliveryMethod === "home" ? deliveryAddress : undefined,
				deliveryMethod: deliveryMethod,
			});

			// Clear the cart and close the cart sidebar
			clearCart();
			setIsCartOpen(false);

			// Show confirmation and redirect to my-orders
			setShowConfirmation(true);
			router.push("/user/my-orders");
		} catch (err) {
			console.error("Payment error:", err);
			setError(
				err instanceof Error ? err.message : "Failed to process payment",
			);
		}
		setIsProcessing(false);
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
							<span className="text-lg">{item.name} - </span>
							<span className="text-lg">{item.is_grounded ? "Grano" : "Molido"}</span>
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
									{isLoadingPrices ? (
										<div className="flex items-center gap-2">
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
								<span className="text-sm text-gray-500">{t("loading")}</span>
										</div>
									) : (
										<>
											<span className="font-medium">
												{(() => {
													const unitPrice = priceData?.unitPrices?.[item.id] 
														? Number(priceData.unitPrices[item.id]) 
														: item.price;
													return (
														unitPrice
													).toFixed(2);
												})()}{" "}
												{selectedCurrency}
											</span>
										</>
									)}
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
							<span className="block font-medium">{deliveryMethod === "home" ? t("my_home") : t("pick_up_at_meetup")}</span>
							{deliveryMethod === "home" && (
								<>
									<span className="block text-sm text-gray-500">
										{deliveryAddress.street}, {deliveryAddress.apartment}
									</span>
									<span className="block text-sm text-gray-500">
										{deliveryAddress.city} {deliveryAddress.zipCode}
									</span>
								</>
							)}
						</div>
					</div>
					<Separator />

					<div className="flex justify-between py-2">
						<span className="text-gray-600">{t("subtotal")}</span>
						{isLoadingPrices ? (
							<div className="flex items-center gap-2">
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
								<span className="text-sm text-gray-500">{t("loading")}</span>
							</div>
						) : (
							<span>
								{productPrice.toFixed(2)} {selectedCurrency}
							</span>
						)}
					</div>
					<Separator />

					<div className="flex justify-between py-2">
						<span className="text-gray-600">{t("delivery_price")}</span>
						<span>
							+{deliveryAmount.toFixed(2)} {selectedCurrency}
						</span>
					</div>
					<Separator />

					<div className="flex justify-between items-center py-2">
						<span className="font-medium text-lg">{t("total_price")}</span>
						<div className="flex flex-col items-end gap-1">
							{isLoadingPrices ? (
								<div className="flex items-center gap-2">
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
									<span className="text-sm text-gray-500">{t("loading")}</span>
								</div>
							) : (
								<div className="flex items-center gap-2">
									<span className="font-bold text-lg">
										{totalPrice.toFixed(2)} {selectedCurrency}
									</span>
									<ArrowDownIcon className="h-4 w-4 text-yellow-500" />
								</div>
							)}
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
					disabled={isProcessing || cartItems.length === 0 || isLoadingPrices || deliveryMethod === "home"}
				>
					{t("change_currency")}
				</Button>

				<Button
					onClick={handleProceedToPayment}
					className={`w-full bg-yellow-400 hover:bg-yellow-500 text-black mt-6 h-14 ${cartItems.length === 0 || isLoadingPrices ? "opacity-50 cursor-not-allowed" : ""}`}
					disabled={isProcessing || cartItems.length === 0 || isLoadingPrices}
				>
				{isProcessing ? t("processing_payment") : isLoadingPrices ? t("loading") : t("proceed_to_payment")}
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
