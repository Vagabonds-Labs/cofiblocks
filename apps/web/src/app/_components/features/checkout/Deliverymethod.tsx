"use client";

import {
	CalendarIcon,
	ChevronRightIcon,
	MapPinIcon,
	TruckIcon,
	UsersIcon,
} from "@heroicons/react/24/outline";
import Button from "@repo/ui/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SelectableOption } from "./SelectableOption";
import { api } from "~/trpc/react";

interface DeliveryMethodProps {
	readonly onNext: (method: string, totalPrice: number, location?: string, deliveryPrice?: number) => void;
	readonly productPrice: number; // Product price from cart
	readonly packageCount: number; // Number of bags/packages
}

export default function DeliveryMethod({ onNext, productPrice, packageCount }: DeliveryMethodProps) {
	const { t } = useTranslation();
	const [selectedMethod, setSelectedMethod] = useState<string>("");
	const [selectedLocation, setSelectedLocation] = useState<string>("");

	const DELIVERY_PRICES = {
		GAM: 4,
		OUTSIDE: 5.5,
	} as const;

	const locations = [
		{ value: "gam", label: t("im_in_gam"), price: DELIVERY_PRICES.GAM, description: `$${DELIVERY_PRICES.GAM}` },
		{ value: "outside", label: t("im_not_in_gam"), price: DELIVERY_PRICES.OUTSIDE, description: `$${DELIVERY_PRICES.OUTSIDE}` },
	];

	// Get delivery fee from backend API
	const { data: gamDeliveryFee } = api.order.getDeliveryFee.useQuery({
		province: "san_jose", // Use GAM province for GAM pricing
		packageCount: packageCount,
	}, {
		enabled: selectedLocation === "gam",
	});

	const { data: outsideDeliveryFee } = api.order.getDeliveryFee.useQuery({
		province: "puntarenas", // Use outside GAM province for outside pricing
		packageCount: packageCount,
	}, {
		enabled: selectedLocation === "outside",
	});

	const handleNext = () => {
		if (selectedMethod === "home" && selectedLocation) {
			// Get delivery price from API results
			const deliveryPrice = selectedLocation === "gam" 
				? (gamDeliveryFee ?? 0)
				: (outsideDeliveryFee ?? 0);
			
			// Calculate total price: product price + delivery price
			const totalPrice = productPrice + deliveryPrice;
			
			onNext(selectedMethod, totalPrice, selectedLocation, deliveryPrice);
		} else if (selectedMethod === "meetup") {
			// For meetup, no delivery cost, only product price
			onNext(selectedMethod, productPrice, undefined, 0);
		}
	};

	return (
		<div className="flex flex-col min-h-[calc(100vh-120px)] font-manrope">
			<div className="flex-1 p-4">
				<h2 className="text-lg font-medium mb-4 text-content-title">
					{t("delivery_method_label")}
				</h2>

				<div className="space-y-3">
					<SelectableOption
						icon={
							<TruckIcon
								className="h-6 w-6 text-success-default"
								aria-hidden="true"
							/>
						}
						label={t("send_to_my_home")}
						sublabel={t("only_costa_rica")}
						isSelected={selectedMethod === "home"}
						onClick={() => {
							setSelectedMethod("home");
							setSelectedLocation("");
						}}
					/>

					<SelectableOption
						icon={
							<UsersIcon
								className="h-6 w-6 text-success-default"
								aria-hidden="true"
							/>
						}
						label={t("pick_up_at_meetup")}
						sublabel={t("free")}
						isSelected={selectedMethod === "meetup"}
						onClick={() => {
							setSelectedMethod("meetup");
							setSelectedLocation("");
						}}
					/>
				</div>

				{selectedMethod === "home" && (
					<div className="mt-4">
						<h3 className="text-lg font-medium mb-4 text-content-title">
							{t("im_in")}
						</h3>
						<div className="space-y-3">
							{locations.map((location) => {
								// Get the actual delivery fee from API
								const actualFee = location.value === "gam" ? gamDeliveryFee : outsideDeliveryFee;
								const displayPrice = actualFee ? `$${actualFee.toFixed(2)}` : location.description;
								
								return (
									<SelectableOption
										key={location.value}
										icon={
											<MapPinIcon
												className="h-6 w-6 text-success-default"
												aria-hidden="true"
											/>
										}
										label={location.label}
										sublabel={displayPrice}
										isSelected={selectedLocation === location.value}
										onClick={() => {
											setSelectedLocation(location.value);
										}}
									/>
								);
							})}
						</div>
					</div>
				)}

				<Button
					variant="transparent"
					className="w-full mt-4 justify-between p-4"
					onClick={() => {
						window.open("https://lu.ma/cofiblocks", "_blank");
					}}
				>
					<div className="flex items-center gap-3">
						<CalendarIcon
							className="h-6 w-6 text-content-title"
							aria-hidden="true"
						/>
						<span className="text-content-body-default">
							{t("check_meetup_calendar")}
						</span>
					</div>
					<ChevronRightIcon
						className="h-5 w-5 text-content-body-soft"
						aria-hidden="true"
					/>
				</Button>
			</div>

			<div className="p-4">
				<Button
					variant="primary"
					size="xl"
					onClick={handleNext}
					disabled={
						!selectedMethod || (selectedMethod === "home" && !selectedLocation)
					}
					className="w-full"
				>
					{t("next")}
				</Button>
			</div>
		</div>
	);
}
