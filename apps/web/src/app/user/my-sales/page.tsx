"use client";

import { FunnelIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@repo/ui/button";
import CheckBox from "@repo/ui/form/checkBox";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import OrderListItem from "~/app/_components/features/OrderListItem";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import BottomModal from "~/app/_components/ui/BottomModal";
import {
	DeliveryMethod,
	type FormValues,
	SalesStatusType,
	filtersSchema,
} from "~/types";

const mockedOrders = [
	{
		date: "october_18",
		items: [
			{
				id: "1",
				productName: "product_name_1",
				buyerName: "buyer1_fullname",
				status: SalesStatusType.Paid,
				delivery: DeliveryMethod.Address,
			},
			{
				id: "2",
				productName: "product_name_2",
				buyerName: "buyer2_fullname",
				status: SalesStatusType.Paid,
				delivery: DeliveryMethod.Meetup,
			},
		],
	},
	{
		date: "september_20",
		items: [
			{
				id: "3",
				productName: "product_name_1",
				buyerName: "buyer1_fullname",
				status: SalesStatusType.Delivered,
				delivery: DeliveryMethod.Address,
			},
			{
				id: "4",
				productName: "product_name_2",
				buyerName: "buyer2_fullname",
				status: SalesStatusType.Delivered,
				delivery: DeliveryMethod.Meetup,
			},
		],
	},
];

export default function MySales() {
	const { t } = useTranslation();
	const [searchTerm, setSearchTerm] = useState("");
	const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
	const [filteredOrders, setFilteredOrders] = useState(mockedOrders);
	const [activeFilters, setActiveFilters] = useState<FormValues>({});
	const router = useRouter();

	const openFiltersModal = () => {
		setIsFiltersModalOpen(true);
	};

	const closeFiltersModal = () => {
		setIsFiltersModalOpen(false);
	};

	const { control, handleSubmit } = useForm<FormValues>({
		resolver: zodResolver(filtersSchema),
		defaultValues: {
			statusPaid: false,
			statusPrepared: false,
			statusShipped: false,
			statusDelivered: false,
			deliveryAddress: false,
			deliveryMeetup: false,
		},
	});

	const onSubmit = (data: FormValues) => {
		console.log(data);
		setActiveFilters(data);
		closeFiltersModal();
	};

	const handleItemClick = (id: string) => {
		router.push(`/user/my-sales/${id}`);
	};

	useEffect(() => {
		const newFilteredOrders = mockedOrders
			.map((orderGroup) => ({
				...orderGroup,
				items: orderGroup.items.filter((item) => {
					const matchesSearch = searchTerm
						? item.buyerName.toLowerCase().includes(searchTerm.toLowerCase())
						: true;

					const activeStatusFilters = [
						activeFilters.statusPaid,
						activeFilters.statusPrepared,
						activeFilters.statusShipped,
						activeFilters.statusDelivered,
					];

					const matchesStatus = !activeStatusFilters.some(Boolean)
						? true
						: (activeFilters.statusPaid &&
								item.status === SalesStatusType.Paid) ??
							(activeFilters.statusPrepared &&
								item.status === SalesStatusType.Prepared) ??
							(activeFilters.statusShipped &&
								item.status === SalesStatusType.Shipped) ??
							(activeFilters.statusDelivered &&
								item.status === SalesStatusType.Delivered);

					const activeDeliveryFilters = [
						activeFilters.deliveryAddress,
						activeFilters.deliveryMeetup,
					];

					const matchesDelivery = !activeDeliveryFilters.some(Boolean)
						? true
						: (activeFilters.deliveryAddress &&
								item.delivery === DeliveryMethod.Address) ??
							(activeFilters.deliveryMeetup &&
								item.delivery === DeliveryMethod.Meetup);

					return matchesSearch && matchesStatus && matchesDelivery;
				}),
			}))
			.filter((orderGroup) => orderGroup.items.length > 0);

		if (!searchTerm && !Object.values(activeFilters).some(Boolean)) {
			setFilteredOrders(mockedOrders);
		} else {
			setFilteredOrders(newFilteredOrders);
		}
	}, [searchTerm, activeFilters]);

	return (
		<ProfileOptionLayout title={t("my_sellers")}>
			<div className="bg-white rounded-lg p-6 space-y-6">
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

				{filteredOrders.map((orderGroup, index) => (
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
										status={order.status}
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

			<BottomModal isOpen={isFiltersModalOpen} onClose={closeFiltersModal}>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<h3 className="text-xl font-semibold my-4 text-content-title">
						{t("delivery_method_label")}
					</h3>
					<div className="space-y-4">
						<>
							<CheckBox
								name={`delivery${DeliveryMethod.Address}`}
								label={t(
									`delivery_method.${DeliveryMethod.Address.toLowerCase()}`,
								)}
								control={control}
							/>
							<hr className="my-2 border-surface-primary-soft" />
							<CheckBox
								name={`delivery${DeliveryMethod.Meetup}`}
								label={t(
									`delivery_method.${DeliveryMethod.Meetup.toLowerCase()}`,
								)}
								control={control}
							/>
						</>
					</div>
					<h3 className="text-xl font-semibold my-4 text-content-title">
						{t("status")}
					</h3>
					<div className="flex flex-col gap-2">
						<>
							<CheckBox
								name={`status${SalesStatusType.Paid}`}
								label={t(`order_status.${SalesStatusType.Paid.toLowerCase()}`)}
								control={control}
							/>
							<hr className="my-2 border-surface-primary-soft" />
							<CheckBox
								name={`status${SalesStatusType.Prepared}`}
								label={t(
									`order_status.${SalesStatusType.Prepared.toLowerCase()}`,
								)}
								control={control}
							/>
							<hr className="my-2 border-surface-primary-soft" />
							<CheckBox
								name={`status${SalesStatusType.Shipped}`}
								label={t(
									`order_status.${SalesStatusType.Shipped.toLowerCase()}`,
								)}
								control={control}
							/>
							<hr className="my-2 border-surface-primary-soft" />
							<CheckBox
								name={`status${SalesStatusType.Delivered}`}
								label={t(
									`order_status.${SalesStatusType.Delivered.toLowerCase()}`,
								)}
								control={control}
							/>
						</>
					</div>
					<Button type="submit" className="w-full !mt-6">
						{t("apply")}
					</Button>
				</form>
			</BottomModal>
		</ProfileOptionLayout>
	);
}
