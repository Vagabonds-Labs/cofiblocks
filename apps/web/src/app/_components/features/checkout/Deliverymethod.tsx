"use client";

import {
	ArrowLeftIcon,
	CalendarIcon,
	ChevronRightIcon,
	TruckIcon,
	UsersIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState } from "react";

interface DeliveryMethodProps {
	readonly onNext: () => void;
}

export default function DeliveryMethod({ onNext }: DeliveryMethodProps) {
	const [selectedMethod, setSelectedMethod] = useState<string>("");

	return (
		<div className="p-4 flex flex-col min-h-[calc(100vh-120px)]">
			<div className="flex-1">
				<Link href="/shopping-cart">
					<div className="flex items-center gap-2 bg-[#FFF8E7] p-3 rounded-lg mb-6">
						<ArrowLeftIcon className="h-5 w-5" />
						<span className="text-xl">My Cart</span>
					</div>
				</Link>

				<h2 className="text-lg font-medium mb-4">Delivery method</h2>

				<div className="space-y-3">
					<button
						type="button"
						onClick={() => setSelectedMethod("home")}
						className={`w-full p-4 rounded-lg bg-surface-primary-soft hover:bg-[#F0F1F2] transition-colors
              flex items-center justify-between`}
					>
						<div className="flex items-center gap-3">
							<TruckIcon className="h-6 w-6 text-[#198754]" />
							<span className="text-base">Send it to my home</span>
						</div>
						<div
							className={`w-6 h-6 rounded-full border-2 ${
								selectedMethod === "home"
									? "border-[#198754] bg-[#198754]"
									: "border-gray-300"
							}`}
						/>
					</button>

					<button
						type="button"
						onClick={() => setSelectedMethod("meetup")}
						className={`w-full p-4 rounded-lg bg-surface-primary-soft hover:bg-[#F0F1F2] transition-colors
              flex items-center justify-between`}
					>
						<div className="flex items-center gap-3">
							<UsersIcon className="h-6 w-6 text-[#198754]" />
							<div>
								<span className="text-base">Pick up at meetup</span>
								<p className="text-sm text-gray-500">Free</p>
							</div>
						</div>
						<div
							className={`w-6 h-6 rounded-full border-2 ${
								selectedMethod === "meetup"
									? "border-[#198754] bg-[#198754]"
									: "border-gray-300"
							}`}
						/>
					</button>
				</div>

				<button
					type="button"
					className="w-full mt-6 p-4 rounded-lg bg-[#F8F9FA] hover:bg-[#F0F1F2] transition-colors
            flex items-center justify-between"
				>
					<div className="flex items-center gap-3">
						<CalendarIcon className="h-6 w-6" />
						<span>Check our meetup calendar</span>
					</div>
					<ChevronRightIcon className="h-5 w-5" />
				</button>
			</div>

			<button
				type="button"
				onClick={() => selectedMethod && onNext()}
				disabled={!selectedMethod}
				className="w-full p-4 bg-[#FFC107] hover:bg-[#FDB000] disabled:opacity-50 disabled:hover:bg-[#FFC107]
          rounded-lg text-center font-medium transition-colors mt-auto"
			>
				Next
			</button>
		</div>
	);
}
