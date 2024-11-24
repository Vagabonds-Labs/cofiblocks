"use client";

import { MapPinIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

interface LocationSelectorProps {
	onNext: (location: string) => void;
}

export default function LocationSelector({ onNext }: LocationSelectorProps) {
	const [selectedLocation, setSelectedLocation] = useState<string>("");

	return (
		<div className="p-4 flex flex-col min-h-[calc(100vh-120px)]">
			<div className="flex-1">
				<h2 className="text-lg font-medium mb-4">I&apos;m in</h2>

				<div className="space-y-3">
					<button
						type="button"
						onClick={() => setSelectedLocation("gam")}
						className={`w-full p-4 rounded-lg bg-[#F8F9FA] hover:bg-[#F0F1F2] transition-colors
              flex items-center justify-between`}
						aria-pressed={selectedLocation === "gam"}
					>
						<div className="flex items-center gap-3">
							<MapPinIcon className="h-6 w-6 text-[#198754]" />
							<div className="flex flex-col items-start">
								<span className="text-base">I&apos;m in GAM</span>
								<span className="text-sm text-gray-500">+ 20 USD</span>
							</div>
						</div>
						<div
							className={`w-6 h-6 rounded-full border-2 ${
								selectedLocation === "gam"
									? "border-[#198754] bg-[#198754]"
									: "border-gray-300"
							}`}
						/>
					</button>

					<button
						type="button"
						onClick={() => setSelectedLocation("outside")}
						className={`w-full p-4 rounded-lg bg-[#F8F9FA] hover:bg-[#F0F1F2] transition-colors
              flex items-center justify-between`}
						aria-pressed={selectedLocation === "outside"}
					>
						<div className="flex items-center gap-3">
							<MapPinIcon className="h-6 w-6 text-[#198754]" />
							<div className="flex flex-col items-start">
								<span className="text-base">I&apos;m not in GAM</span>
								<span className="text-sm text-gray-500">+ 40 USD</span>
							</div>
						</div>
						<div
							className={`w-6 h-6 rounded-full border-2 ${
								selectedLocation === "outside"
									? "border-[#198754] bg-[#198754]"
									: "border-gray-300"
							}`}
						/>
					</button>
				</div>
			</div>

			<button
				type="button"
				onClick={() => selectedLocation && onNext(selectedLocation)}
				disabled={!selectedLocation}
				className="w-full p-4 bg-[#FFC107] hover:bg-[#FDB000] disabled:opacity-50 disabled:hover:bg-[#FFC107]
          rounded-lg text-center font-medium transition-colors mt-auto"
			>
				Next
			</button>
		</div>
	);
}
