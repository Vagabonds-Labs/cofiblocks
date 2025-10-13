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

interface DeliveryMethodProps {
	readonly onNext: (method: string, price: number, location?: string) => void;
}

export default function DeliveryMethod({ onNext }: DeliveryMethodProps) {
	const { t } = useTranslation();
	const [selectedMethod, setSelectedMethod] = useState<string>("");
	const [selectedLocation, setSelectedLocation] = useState<string>("");
	//const [deliveryPrice, setDeliveryPrice] = useState<number>(0);

	const locations = [
		{ value: "gam", label: t("im_in_gam"), price: 20 },
		{ value: "outside", label: t("im_not_in_gam"), price: 40 },
	];

	const handleNext = () => {
		if (selectedMethod === "home" && selectedLocation) {
			const price =
				locations.find((loc) => loc.value === selectedLocation)?.price ?? 0;
			onNext(selectedMethod, price, selectedLocation);
		} else if (selectedMethod === "meetup") {
			onNext(selectedMethod, 0);
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
							{locations.map((location) => (
								<SelectableOption
									key={location.value}
									icon={
										<MapPinIcon
											className="h-6 w-6 text-success-default"
											aria-hidden="true"
										/>
									}
									label={location.label}
									isSelected={selectedLocation === location.value}
									onClick={() => {
										setSelectedLocation(location.value);
									}}
								/>
							))}
						</div>
					</div>
				)}

				<Button
					variant="transparent"
					className="w-full mt-4 justify-between p-4"
					onClick={() => {
						/* Handle calendar click */
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
