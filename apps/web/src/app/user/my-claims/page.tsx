"use client";

import {
	FunnelIcon,
	InformationCircleIcon,
	MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import Button from "@repo/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OrderListItem from "~/app/_components/features/OrderListItem";
import OrderListPriceItem from "~/app/_components/features/OrderListPriceItem";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import { DeliveryMethod, SalesStatus } from "~/types";

import { useTranslation } from "react-i18next";

const mockedOrders = [
	{
		date: "october_18",
		items: [
			{
				id: "1",
				productName: "product_name_1",
				buyerName: "buyer1_fullname",
				status: SalesStatus.Delivered,
				delivery: DeliveryMethod.Address,
				price: 30,
				claimed: false,
			},
			{
				id: "2",
				productName: "product_name_2",
				buyerName: "buyer2_fullname",
				status: SalesStatus.Delivered,
				delivery: DeliveryMethod.Meetup,
				price: 30,
				claimed: false,
			},
		],
	},
	{
		date: "september_20",
		items: [
			{
				id: "3",
				productName: "product_name_3",
				buyerName: "buyer1_fullname",
				status: SalesStatus.Delivered,
				delivery: DeliveryMethod.Address,
				price: 30,
				claimed: true,
			},
			{
				id: "4",
				productName: "product_name_4",
				buyerName: "buyer2_fullname",
				status: SalesStatus.Delivered,
				delivery: DeliveryMethod.Meetup,
				price: 30,
				claimed: true,
			},
		],
	},
];

export default function MyClaims() {
	const [OrdersToClaim, setOrdersToClaim] = useState(mockedOrders);
	const [ClaimedOrders, setClaimedOrders] = useState(mockedOrders);
	const [searchTerm, setSearchTerm] = useState("");
	const [MoneyToClaim, setMoneyToClaim] = useState(0);
	const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
	const { t } = useTranslation();

	const router = useRouter();

	useEffect(() => {
		const unclaimedOrders = mockedOrders
			.map((orderGroup) => ({
				...orderGroup,
				items: orderGroup.items.filter((item) => !item.claimed),
			}))
			.filter((orderGroup) => orderGroup.items.length > 0);

		setOrdersToClaim(unclaimedOrders);

		const totalMoneyToClaim = unclaimedOrders.reduce((total, orderGroup) => {
			return (
				total +
				orderGroup.items.reduce(
					(groupTotal, item) => groupTotal + item.price,
					0,
				)
			);
		}, 0);

		setMoneyToClaim(totalMoneyToClaim);

		const claimedOrders = mockedOrders
			.map((orderGroup) => ({
				...orderGroup,
				items: orderGroup.items.filter((item) => item.claimed),
			}))
			.filter((orderGroup) => orderGroup.items.length > 0);

		setClaimedOrders(claimedOrders);
	}, []);

	const openFiltersModal = () => {
		setIsFiltersModalOpen(true);
	};

	const handleItemClick = (id: string) => {
		window.location.href = `/user/my-claims/${id}`;
	};

	return (
		<ProfileOptionLayout title={t("my_claims")}>
			<div className="mb-4">
				<div>
					<h3 className="text-sm font-semibold text-gray-500 mb-2 flex items-center">
						{t("total_balance_receivable")}
						<InformationCircleIcon className="w-5 h-5 ml-2" />
					</h3>
				</div>
				<div>
					<h1 className="text-2xl font-semibold text-gray-800">
						{MoneyToClaim.toFixed(2)} USD
					</h1>
				</div>
				<div className="text-l text-green-600">
					~{(Number(MoneyToClaim) * 520).toFixed(2)} CRC
				</div>
			</div>
			<hr className="border-t border-gray-300 my-4" />
			<div className="mb-6">
				{OrdersToClaim.map((orderGroup, index) => (
					<div key={`${orderGroup.date}-${index}`}>
						<h2 className="text-lg font-semibold text-gray-500 mb-2">
							{t(orderGroup.date)}
						</h2>
						<div className="bg-white rounded-lg">
							{orderGroup.items.map((order, orderIndex) => (
								<div key={order.id || orderIndex}>
									<OrderListPriceItem
										productName={t(order.productName)}
										name={t(order.buyerName)}
										price={order.price}
										onClick={() => handleItemClick(order.id)}
									/>
									{orderIndex < orderGroup.items.length - 1 && (
										<hr className="my-2 border-surface-primary-soft" />
									)}
								</div>
							))}
						</div>
					</div>
				))}
			</div>
			<div className="mb-6">
				<Button
					className="mx-auto mt-5 w-[90%] h-15 px-2"
					onClick={() => router.push("/user/register-coffee")}
				>
					{t("recieve")} {MoneyToClaim.toFixed(2)} USD
				</Button>
			</div>
			<div className="mb-6">
				<h1 className="text-2xl font-semibold mb-2 flex items-center">
					{t("history")}
				</h1>
			</div>
			<div className="mb-6">
				<div className="flex space-x-2">
					<div className="flex-grow relative">
						<MagnifyingGlassIcon className="w-6 h-6 absolute left-3 top-1/2 transform -translate-y-1/2 text-content-body-default" />
						<input
							type="text"
							placeholder={t("search_seller_placeholder")}
							className="w-full pl-10 pr-4 py-3 px-[1rem] border border-surface-border rounded-[0.5rem] focus:outline-none focus:ring-2 focus:ring-blue-500 text-content-body-default placeholder-content-body-default"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<Button
						className="py-3 rounded-lg h-fit"
						type="button"
						onClick={openFiltersModal}
					>
						<FunnelIcon className="w-6 h-6 text-content-body-default" />
					</Button>
				</div>
			</div>
			<div className="mb-6">
				{ClaimedOrders.map((orderGroup, index) => (
					<div key={`${orderGroup.date}-${index}`}>
						<h2 className="text-lg font-semibold text-gray-500 mb-2">
							{t(orderGroup.date)}
						</h2>
						<div className="bg-white rounded-lg">
							{orderGroup.items.map((order, orderIndex) => (
								<>
									<OrderListItem
										key={`${order.productName}-${orderIndex}`}
										productName={t(order.productName)}
										name={t(order.buyerName)}
										status={t(order.status)}
										onClick={() => handleItemClick(order.id)}
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
