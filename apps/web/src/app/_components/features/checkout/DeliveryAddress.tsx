"use client";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState } from "react";

interface DeliveryAddressProps {
	readonly onNext: (address: {
		street: string;
		apartment: string;
		city: string;
		zipCode: string;
	}) => void;
}

export default function DeliveryAddress({ onNext }: DeliveryAddressProps) {
	const [address, setAddress] = useState({
		street: "",
		apartment: "",
		city: "",
		zipCode: "",
	});

	const isFormValid = address.street && address.city && address.zipCode;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isFormValid) {
			onNext(address);
		}
	};

	return (
		<div className="p-4 flex flex-col min-h-[calc(100vh-120px)]">
			<div className="flex-1">
				<h2 className="text-lg font-medium mb-4">Delivery address</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<label
							htmlFor="address"
							className="block text-sm text-content-body-default"
						>
							Address
						</label>
						<input
							type="text"
							id="address"
							placeholder="Type here"
							value={address.street}
							onChange={(e) =>
								setAddress((prev) => ({ ...prev, street: e.target.value }))
							}
							className="w-full p-3 rounded-lg border border-surface-border bg-surface-inverse placeholder:text-content-body-soft focus:outline-none focus:ring-2 focus:ring-surface-primary-default"
							required
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="apartment"
							className="block text-sm text-content-body-default"
						>
							Apartment, suite, etc
						</label>
						<input
							type="text"
							id="apartment"
							placeholder="Type here"
							value={address.apartment}
							onChange={(e) =>
								setAddress((prev) => ({ ...prev, apartment: e.target.value }))
							}
							className="w-full p-3 rounded-lg border border-surface-border bg-surface-inverse placeholder:text-content-body-soft focus:outline-none focus:ring-2 focus:ring-surface-primary-default"
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="city"
							className="block text-sm text-content-body-default"
						>
							City
						</label>
						<input
							type="text"
							id="city"
							placeholder="Type here"
							value={address.city}
							onChange={(e) =>
								setAddress((prev) => ({ ...prev, city: e.target.value }))
							}
							className="w-full p-3 rounded-lg border border-surface-border bg-surface-inverse placeholder:text-content-body-soft focus:outline-none focus:ring-2 focus:ring-surface-primary-default"
							required
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="zipCode"
							className="block text-sm text-content-body-default"
						>
							ZIP code
						</label>
						<input
							type="text"
							id="zipCode"
							placeholder="Type here"
							value={address.zipCode}
							onChange={(e) =>
								setAddress((prev) => ({ ...prev, zipCode: e.target.value }))
							}
							className="w-full p-3 rounded-lg border border-surface-border bg-surface-inverse placeholder:text-content-body-soft focus:outline-none focus:ring-2 focus:ring-surface-primary-default"
							required
						/>
					</div>
				</form>
			</div>

			<button
				type="button"
				onClick={handleSubmit}
				disabled={!isFormValid}
				className="w-full p-4 bg-[#FFC107] hover:bg-[#FDB000] disabled:opacity-50 disabled:hover:bg-[#FFC107]
          rounded-lg text-center font-medium transition-colors mt-6"
			>
				Next
			</button>
		</div>
	);
}
