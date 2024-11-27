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

interface DeliveryMethodProps {
	readonly onNext: (method: string, location?: string) => void;
}

export default function DeliveryMethod({ onNext }: DeliveryMethodProps) {
	const [selectedMethod, setSelectedMethod] = useState<string>("");
	const [selectedLocation, setSelectedLocation] = useState<string>("");

	const locations = [
		{ value: "gam", label: "I'm in GAM", price: "+ 20 USD" },
		{ value: "outside", label: "I'm not in GAM", price: "+ 40 USD" },
	];

	const handleNext = () => {
		if (selectedMethod === "home" && selectedLocation) {
			onNext(selectedMethod, selectedLocation);
		} else if (selectedMethod === "meetup") {
			onNext(selectedMethod);
		}
	};

	return (
		<div className="flex flex-col min-h-[calc(100vh-120px)] font-manrope">
			<div className="flex-1 p-4">
				<h2 className="text-lg font-medium mb-4 text-content-title">
					Delivery method
				</h2>

				<div className="space-y-3">
					<Button
						variant="soft"
						size="xl"
						onClick={() => {
							setSelectedMethod("home");
							setSelectedLocation("");
						}}
						className="w-full justify-between p-4"
						aria-pressed={selectedMethod === "home"}
					>
						<div className="flex items-center gap-3">
							<TruckIcon
								className="h-6 w-6 text-success-default"
								aria-hidden="true"
							/>
							<div className="text-left">
								<span className="text-base text-content-body-default">
									Send it to my home
								</span>
								<p className="text-sm text-content-body-soft">+ 20 USD</p>
							</div>
						</div>
						<div
							className={`w-6 h-6 rounded-full border-2 ${
								selectedMethod === "home"
									? "border-surface-secondary-default bg-surface-secondary-default"
									: "border-surface-border bg-transparent"
							}`}
							aria-hidden="true"
						/>
					</Button>

					<Button
						variant="soft"
						size="xl"
						onClick={() => {
							setSelectedMethod("meetup");
							setSelectedLocation("");
						}}
						className="w-full justify-between p-4"
						aria-pressed={selectedMethod === "meetup"}
					>
						<div className="flex items-center gap-3">
							<UsersIcon
								className="h-6 w-6 text-success-default"
								aria-hidden="true"
							/>
							<div className="text-left">
								<span className="text-base text-content-body-default">
									Pick up at meetup
								</span>
								<p className="text-sm text-content-body-soft">Free</p>
							</div>
						</div>
						<div
							className={`w-6 h-6 rounded-full border-2 ${
								selectedMethod === "meetup"
									? "border-surface-secondary-default bg-surface-secondary-default"
									: "border-surface-border bg-transparent"
							}`}
							aria-hidden="true"
						/>
					</Button>
				</div>

				{selectedMethod === "home" && (
					<div className="mt-4">
						<h3 className="text-lg font-medium mb-4 text-content-title">
							I&apos;m in
						</h3>
						<div className="space-y-3">
							{locations.map((location) => (
								<Button
									key={location.value}
									variant="soft"
									size="xl"
									onClick={() => setSelectedLocation(location.value)}
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
							Check our meetup calendar
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
					Next
				</Button>
			</div>
		</div>
	);
}
