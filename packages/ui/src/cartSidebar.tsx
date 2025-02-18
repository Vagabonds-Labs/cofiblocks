"use client";

import Button from "./button";
import { Sidebar } from "./sidebar";
import { Text } from "./typography";

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
	totalPrice,
	onCheckout,
	checkoutLabel = "Checkout",
}: CartSidebarProps) {
	const footer = totalPrice !== undefined && onCheckout && (
		<div className="flex flex-col gap-4">
			<div className="flex justify-between items-center">
				<Text className="text-base font-semibold">Total</Text>
				<Text className="text-lg font-bold">${totalPrice.toFixed(2)} USD</Text>
			</div>
			<Button variant="primary" onClick={onCheckout} className="w-full">
				{checkoutLabel}
			</Button>
		</div>
	);

	return (
		<Sidebar isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
			{children}
		</Sidebar>
	);
}
