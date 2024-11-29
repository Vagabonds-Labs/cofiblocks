import { LightBulbIcon } from "@heroicons/react/24/solid";
import React from "react";

type StatusBannerProps = {
	orderStatus: string;
	isProducer: boolean;
};

const statusText = {
	Paid: "The Producer is already preparing your order",
	Shipped: "The Producer has already shipped your order",
	Prepared: "The Producer has already prepared your order",
	Delivered: "Your order has arrived. Enjoy your coffee",
};

export function StatusBanner({ orderStatus, isProducer }: StatusBannerProps) {
	if (isProducer && orderStatus !== "Delivered") {
		return (
			<div className="bg-surface-primary-soft p-4 rounded-lg flex items-center justify-between">
				<LightBulbIcon className="w-8 h-8 mr-4" />
				<div>
					<p className="text-success-content font-bold flex items-center">
						New order
					</p>
					<p className="text-xs text-gray-600">
						You have a new order. Let&apos;s start the preparations.
					</p>
				</div>
				<button
					className="bg-surface-secondary-default px-3 py-1 ml-4 rounded-lg"
					type="button"
				>
					Tips
				</button>
			</div>
		);
	}

	return (
		<div className="bg-surface-primary-soft p-4 rounded-lg flex items-center justify-between">
			<div>
				<p className="text-success-content flex items-center">
					<LightBulbIcon className="w-6 h-6 mr-4" />
					{statusText[orderStatus as keyof typeof statusText] || ""}
				</p>
			</div>
		</div>
	);
}
