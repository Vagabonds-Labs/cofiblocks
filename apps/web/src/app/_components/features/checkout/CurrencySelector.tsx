"use client";

import Button from "@repo/ui/button";
import Modal from "@repo/ui/modal";
import { useState } from "react";

interface CurrencySelectorProps {
	isOpen: boolean;
	onClose: () => void;
	onSelect: (currency: string) => void;
}

const currencies = [
	{ id: "usd", name: "USD" },
	{ id: "usdt", name: "USDT" },
	{ id: "btc", name: "BTC" },
	{ id: "strk", name: "STRK" },
];

export function CurrencySelector({
	isOpen,
	onClose,
	onSelect,
}: CurrencySelectorProps) {
	const [selectedCurrency, setSelectedCurrency] = useState("usd");

	const handleApply = () => {
		onSelect(selectedCurrency);
		onClose();
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Currency"
			buttons={[
				{
					label: "Apply",
					onClick: handleApply,
					variant: "primary",
				},
			]}
		>
			<div className="space-y-4">
				{currencies.map((currency) => (
					<Button
						type="button"
						key={currency.id}
						onClick={() => setSelectedCurrency(currency.id)}
						className={`relative flex w-full cursor-pointer items-center justify-between rounded-lg px-5 py-4 ${
							selectedCurrency === currency.id ? "bg-yellow-50" : "bg-white"
						}`}
					>
						<span className="text-base">{currency.name}</span>
						<div
							className={`h-5 w-5 rounded-full border ${
								selectedCurrency === currency.id
									? "border-4 border-yellow-400 bg-white"
									: "border-2 border-gray-300 bg-white"
							}`}
						/>
					</Button>
				))}
			</div>
		</Modal>
	);
}
