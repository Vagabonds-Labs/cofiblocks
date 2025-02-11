import Button from "@repo/ui/button";
import { InfoCard } from "@repo/ui/infoCard";
import { Text } from "@repo/ui/typography";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface SelectionTypeCardProps {
	price: number;
	quantity: number;
	bagsAvailable: number;
	onQuantityChange: (quantity: number) => void;
	onAddToCart: () => void;
	onConnect?: () => void;
	isAddingToCart?: boolean;
	isConnected?: boolean;
}

export function SelectionTypeCard({
	price,
	quantity,
	bagsAvailable,
	onQuantityChange,
	onAddToCart,
	onConnect,
	isAddingToCart = false,
	isConnected = false,
}: SelectionTypeCardProps) {
	const [selectedOption, setSelectedOption] = useState<"bean" | "grounded">(
		"bean",
	);

	const { t } = useTranslation();

	const coffeeOptions = [
		{
			label: t("coffee_type.bean"),
			iconSrc: "/images/product-details/Menu-4.svg",
			selected: selectedOption === "bean",
			onClick: () => setSelectedOption("bean"),
		},
		{
			label: t("coffee_type.grounded"),
			iconSrc: "/images/product-details/Menu-4.svg",
			selected: selectedOption === "grounded",
			onClick: () => setSelectedOption("grounded"),
		},
	];

	const handleAddToCart = () => {
		onAddToCart();
		toast.success("Product added to cart successfully!");
	};

	return (
		<InfoCard title={t("select_coffee_type")} options={coffeeOptions}>
			<div className="flex flex-col">
				<Text className="text-sm text-content-body-default">
					{t("unit_price", { weight: "340g" })}: {price} USD
				</Text>
				<div>
					<span className="text-2xl font-bold text-content-title">
						{price * quantity} USD
					</span>
					<span className="text-sm text-content-body-default ml-1">
						/{t("total")}
					</span>
				</div>
			</div>

			{isConnected ? (
				<>
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
						<Text className="text-base text-content-body-default">
							{quantity}
						</Text>
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

					<Button
						variant="primary"
						onClick={handleAddToCart}
						disabled={isAddingToCart}
					>
						{isAddingToCart ? t("adding_to_cart") : t("add_to_cart")}
					</Button>
				</>
			) : (
				<Button variant="primary" onClick={onConnect}>
					{t("Connect")}
				</Button>
			)}
		</InfoCard>
	);
}
