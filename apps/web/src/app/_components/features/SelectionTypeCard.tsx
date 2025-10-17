import Button from "@repo/ui/button";
import { InfoCard } from "@repo/ui/infoCard";
import { Text } from "@repo/ui/typography";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface SelectionTypeCardProps {
	price: number;
	quantity: number;
	stock: number;
	ground_stock: number;
	bean_stock: number;
	onQuantityChange: (quantity: number) => void;
	onAddToCart: () => void;
	isAddingToCart?: boolean;
	onSelectionChange: (option: "bean" | "grounded") => void;
}

export function SelectionTypeCard({
	price,
	quantity,
	stock: _stock,
	ground_stock,
	bean_stock,
	onQuantityChange,
	onAddToCart,
	isAddingToCart = false,
	onSelectionChange,
}: SelectionTypeCardProps) {
	const [selectedOption, setSelectedOption] = useState<"bean" | "grounded">(
		ground_stock > 0 ? "grounded" : "bean",
	);

	const { t } = useTranslation();

	// Maximum available based on selected option
	const maxAvailable = selectedOption === "grounded" ? ground_stock : bean_stock;

	// Notify parent of initial selection
	useEffect(() => {
		onSelectionChange(selectedOption);
	}, [selectedOption, onSelectionChange]);

	const coffeeOptions = [
		{
			label: t("coffee_type.bean"),
			iconSrc: "/images/product-details/Menu-4.svg",
			selected: selectedOption === "bean",
			disabled: bean_stock === 0,
			onClick: () => {
				if (bean_stock > 0) {
					setSelectedOption("bean");
					onSelectionChange("bean");
				}
			},
		},
		{
			label: t("coffee_type.grounded"),
			iconSrc: "/images/product-details/Menu-4.svg",
			selected: selectedOption === "grounded",
			disabled: ground_stock === 0,
			onClick: () => {
				if (ground_stock > 0) {
					setSelectedOption("grounded");
					onSelectionChange("grounded");
				}
			},
		},
	];

	// Ensure quantity never exceeds available stock when option or stock changes
	useEffect(() => {
		if (quantity > maxAvailable && maxAvailable >= 0) {
			onQuantityChange(Math.max(1, maxAvailable));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedOption, bean_stock, ground_stock]);

	const handleAddToCart = () => {
		// Let parent (ProductDetails) handle async success/error toasts
		onAddToCart();
	};

	return (
		<InfoCard title={t("select_coffee_type")} options={coffeeOptions}>
			{/* Stock Information */}
			<div className="bg-gray-50 rounded-lg p-4 mb-4">
				<Text className="text-sm font-medium text-gray-700 mb-3">
					{t("available_stock")}
				</Text>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div className="flex items-center justify-between p-2 bg-white rounded-md">
						<div className="flex items-center">
							<div className="w-3 h-3 bg-amber-600 rounded-full mr-2"></div>
							<Text className="text-sm text-gray-600">
								{t("coffee_type.bean")}
							</Text>
						</div>
						<Text className="text-sm font-medium text-gray-900">
							{bean_stock} {t("units")}
						</Text>
					</div>
					<div className="flex items-center justify-between p-2 bg-white rounded-md">
						<div className="flex items-center">
							<div className="w-3 h-3 bg-amber-800 rounded-full mr-2"></div>
							<Text className="text-sm text-gray-600">
								{t("coffee_type.grounded")}
							</Text>
						</div>
						<Text className="text-sm font-medium text-gray-900">
							{ground_stock} {t("units")}
						</Text>
					</div>
				</div>
			</div>

			<div className="flex flex-col">
				<div>
					<span className="text-2xl font-bold text-content-title">
						{price * quantity} USD
					</span>
					<span className="text-sm text-content-body-default ml-1">
						/{t("total")}
					</span>
				</div>
			</div>

			
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
								onQuantityChange(Math.min(maxAvailable, quantity + 1))
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
						disabled={
							isAddingToCart || maxAvailable === 0 || quantity > maxAvailable
						}
				>
					{isAddingToCart ? t("adding_to_cart") : t("add_to_cart")}
				</Button>
			</>
		</InfoCard>
	);
}
