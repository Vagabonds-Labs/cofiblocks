"use client";

import {
	ChevronRightIcon,
	FunnelIcon,
	MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";

export default function MyOrders() {
	function OrderItem({
		productName,
		sellerName,
		status,
	}: { productName: string; sellerName: string; status: string }) {
		return (
			<div className="flex items-center justify-between py-4">
				<div className="flex items-center space-x-4">
					<img
						src="/images/cafe2.webp"
						alt="Product"
						className="w-12 h-12 rounded-md object-cover"
					/>
					<div>
						<h3 className="font-semibold">{productName}</h3>
						<p className="text-sm text-gray-500">{sellerName}</p>
					</div>
				</div>
				<div className="flex items-center space-x-2">
					<span
						className={`px-2 py-1 text-sm rounded-full ${
							status === "Delivered"
								? "bg-surface-primary-default text-white"
								: "bg-surface-primary-soft text-content-body-default"
						}`}
					>
						{status}
					</span>
					<ChevronRightIcon className="text-content-body-default w-5 h-5" />
				</div>
			</div>
		);
	}

	const orders = [
		{
			date: "October 18",
			items: [
				{
					productName: "Edit profile",
					sellerName: "seller1_fullname",
					status: "Paid",
				},
				{
					productName: "My Orders",
					sellerName: "seller2_fullname",
					status: "Shipped",
				},
				{
					productName: "productName",
					sellerName: "seller3_fullname",
					status: "Delivered",
				},
			],
		},
		{
			date: "September 20",
			items: [
				{
					productName: "productName",
					sellerName: "seller1_fullname",
					status: "Delivered",
				},
				{
					productName: "productName",
					sellerName: "seller2_fullname",
					status: "Delivered",
				},
				{
					productName: "productName",
					sellerName: "seller3_fullname",
					status: "Delivered",
				},
			],
		},
	];

	const [searchTerm, setSearchTerm] = useState("");

	const filteredOrders = orders
		.map((orderGroup) => ({
			...orderGroup,
			items: orderGroup.items.filter((item) =>
				item.sellerName.toLowerCase().includes(searchTerm.toLowerCase()),
			),
		}))
		.filter((orderGroup) => orderGroup.items.length > 0);

	return (
		<ProfileOptionLayout title="My orders">
			<div className="bg-white rounded-lg p-6 space-y-6">
				<div className="flex space-x-2">
					<div className="flex-grow relative">
						<MagnifyingGlassIcon className="w-6 h-6 absolute left-3 top-1/2 transform -translate-y-1/2 text-content-body-default" />
						<input
							type="text"
							placeholder="Search for seller's name"
							className="w-full pl-10 pr-4 py-[0.8125rem] px-[1rem] border border-surface-border rounded-[0.5rem] focus:outline-none focus:ring-2 focus:ring-blue-500 text-content-body-default placeholder-content-body-default"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<button className="p-2 bg-yellow-400 rounded-lg" type="button">
						<FunnelIcon className="w-6 h-6 text-content-body-default" />
					</button>
				</div>

				{filteredOrders.map((orderGroup, index) => (
					<div key={`${orderGroup.date}-${index}`}>
						<h2 className="text-lg font-semibold text-gray-500 mb-2">
							{orderGroup.date}
						</h2>
						<div className="bg-white rounded-lg">
							{orderGroup.items.map((order, orderIndex) => (
								<>
									<OrderItem
										key={`${order.productName}-${orderIndex}`}
										{...order}
									/>
									{orderIndex < orderGroup.items.length - 1 && (
										<hr className="my-2 border-surface-primary-soft" />
									)}
								</>
							))}
						</div>
					</div>
				))}
			</div>
		</ProfileOptionLayout>
	);
}
