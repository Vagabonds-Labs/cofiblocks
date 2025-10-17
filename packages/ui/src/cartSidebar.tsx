"use client";

import Button from "./button";
import { Separator } from "./separator";
import { Sidebar } from "./sidebar";
import { Text } from "./typography";
import { useTranslation } from "react-i18next";

const MARKET_FEE_BPS = 5000; // 50%

interface CartSidebarProps {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
	title: string;
	totalPrice?: number;
	onCheckout?: () => void;
	checkoutLabel?: string;
}

export function CartSidebar({
	isOpen,
	onClose,
	children,
	title,
	totalPrice: basePrice,
	onCheckout,
	checkoutLabel = "Checkout",
}: CartSidebarProps) {
	const { t } = useTranslation();
	const calculateTotalPrice = (price: number): number => {
		const fee = (price * MARKET_FEE_BPS) / 10000;
		return price + fee;
	};

	const totalPrice =
		basePrice !== undefined ? calculateTotalPrice(basePrice) : undefined;

	const footer = totalPrice !== undefined && onCheckout && (
		<div className="flex flex-col gap-4 w-full">
			<Separator className="mb-2" />
			<div className="flex flex-col gap-2">
				<div className="flex justify-between items-center">
					<Text className="text-base font-semibold">{t("cart.total")}</Text>
					<Text className="text-lg font-bold">
						${totalPrice?.toFixed(2)} USD
					</Text>
				</div>
			</div>
			<Button
				variant="primary"
				onClick={onCheckout}
				className={`w-full h-12 text-base font-semibold ${!basePrice || basePrice <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
				disabled={!basePrice || basePrice <= 0}
			>
				{checkoutLabel}
			</Button>
		</div>
	);

	return (
		<Sidebar isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
			<div className="flex-1 overflow-y-auto -mx-4 px-4">{children}</div>
		</Sidebar>
	);
}
