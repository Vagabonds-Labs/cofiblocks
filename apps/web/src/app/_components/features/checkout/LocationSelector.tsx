"use client";

import { MapPinIcon } from "@heroicons/react/24/outline";
import Button from "@repo/ui/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface LocationSelectorProps {
	readonly onSelect: (location: string) => void;
}

export default function LocationSelector({ onSelect }: LocationSelectorProps) {
	const { t } = useTranslation();
	const [selectedLocation, setSelectedLocation] = useState<string>("");

	const locations = [
		{ value: "gam", label: "I'm in GAM", price: "+ 20 USD" },
		{ value: "outside", label: "I'm not in GAM", price: "+ 40 USD" },
	];

	const handleSelect = (location: string) => {
		setSelectedLocation(location);
		onSelect(location);
	};

	return (
		<div className="flex flex-col min-h-[calc(100vh-120px)] font-manrope">
			<div className="flex-1 p-4">
				<h2 className="text-lg font-medium mb-4 text-content-title">
					{t("select_your_location")}
				</h2>

				<div className="space-y-3">
					{locations.map((location) => (
						<Button
							key={location.value}
							variant="soft"
							size="xl"
							onClick={() => handleSelect(location.value)}
							className="w-full justify-between p-4"
							aria-pressed={selectedLocation === location.value}
						>
							<div className="flex items-center gap-3">
								<MapPinIcon
									className="h-6 w-6 text-success-default"
									aria-hidden="true"
								/>
								<div className="text-left">
									<span className="text-base text-content-body-default">
										{location.label}
									</span>
									<p className="text-sm text-content-body-soft">
										{location.price}
									</p>
								</div>
							</div>
							<div
								className={`w-6 h-6 rounded-full border-2 ${
									selectedLocation === location.value
										? "border-surface-secondary-default bg-surface-secondary-default"
										: "border-surface-border bg-transparent"
								}`}
								aria-hidden="true"
							/>
						</Button>
					))}
				</div>
			</div>

			<div className="p-4">
				<Button
					variant="primary"
					size="xl"
					onClick={() => onSelect(selectedLocation)}
					disabled={!selectedLocation}
					className="w-full"
				>
					{t("next")}
				</Button>
			</div>
		</div>
	);
}
