"use client";

import { MapPinIcon } from "@heroicons/react/24/outline";
import Button from "@repo/ui/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SelectableOption } from "./SelectableOption";

interface LocationSelectorProps {
	readonly onSelect: (location: string) => void;
}

export default function LocationSelector({ onSelect }: LocationSelectorProps) {
	const { t } = useTranslation();
	const [selectedLocation, setSelectedLocation] = useState<string>("");

	const locations = [
		{ value: "gam", label: t("im_in_gam") },
		{ value: "outside", label: t("im_not_in_gam") },
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
							onClick={() => handleSelect(location.value)}
						/>
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
