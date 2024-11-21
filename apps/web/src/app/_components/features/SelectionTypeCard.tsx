import Button from "@repo/ui/button";
import { InfoCard } from "@repo/ui/infoCard";
import { Text } from "@repo/ui/typography";
import { useState } from "react";

interface SelectionTypeCardProps {
	price: number;
	quantity: number;
	bagsAvailable: number;
	onQuantityChange: (quantity: number) => void;
	onAddToCart: () => void;
	isAddingToCart?: boolean;
}

export function SelectionTypeCard({
	price,
	quantity,
	bagsAvailable,
	onQuantityChange,
	onAddToCart,
	isAddingToCart = false,
}: SelectionTypeCardProps) {
	const [selectedOption, setSelectedOption] = useState<"bean" | "grounded">(
		"bean",
	);

	const coffeeOptions = [
		{
			label: "Bean",
			iconSrc: "/images/product-details/Menu-4.svg",
			selected: selectedOption === "bean",
			onClick: () => setSelectedOption("bean"),
		},
		{
			label: "Grounded",
			iconSrc: "/images/product-details/Menu-4.svg",
			selected: selectedOption === "grounded",
			onClick: () => setSelectedOption("grounded"),
		},
	];

	return (
		<InfoCard title="Select Coffee Type" options={coffeeOptions}>
			<div className="flex flex-col">
				<Text className="text-sm text-content-body-default">
					Unit price (340g): {price} USD
				</Text>
				<div>
					<span className="text-2xl font-bold text-content-title">
						{price * quantity} USD
					</span>
					<span className="text-sm text-content-body-default ml-1">/total</span>
				</div>
			</div>

			<div className="h-13 px-4 py-3 bg-white rounded-lg border border-surface-border flex justify-between items-center">
				<button
					type="button"
					onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
					className="w-6 h-6 bg-surface-secondary-default rounded grid place-content-center relative"
				>
					<span className="text-white font-bold text-base translate-x-[0.5px] -translate-y-[1px]">
						-
					</span>
				</button>
				<Text className="text-base text-content-body-default">{quantity}</Text>
				<button
					type="button"
					onClick={() =>
						onQuantityChange(Math.min(bagsAvailable, quantity + 1))
					}
					className="w-6 h-6 bg-surface-secondary-default rounded grid place-content-center relative"
				>
					<span className="text-white font-bold text-base translate-x-[0.5px] -translate-y-[1px]">
						+
					</span>
				</button>
			</div>

			<Button variant="primary" onClick={onAddToCart} disabled={isAddingToCart}>
				{isAddingToCart ? "Adding to cart..." : "Add to cart"}
			</Button>
		</InfoCard>
	);
}
