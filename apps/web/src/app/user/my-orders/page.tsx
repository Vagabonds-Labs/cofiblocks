"use client";

import { FunnelIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@repo/ui/button";
import CheckBox from "@repo/ui/form/checkBox";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import OrderListItem from "~/app/_components/features/OrderListItem";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import BottomModal from "~/app/_components/ui/BottomModal";

enum SalesStatusEnum {
	Paid = "Paid",
	Prepared = "Prepared",
	Shipped = "Shipped",
	Delivered = "Delivered",
}

const filtersSchema = z.object({
	statusPaid: z.boolean().optional(),
	statusPrepared: z.boolean().optional(),
	statusShipped: z.boolean().optional(),
	statusDelivered: z.boolean().optional(),
});

type FormValues = z.infer<typeof filtersSchema>;

const mockedOrders = [
	{
		date: "October 18",
		items: [
			{
				id: "1",
				productName: "Edit profile",
				sellerName: "seller1_fullname",
				status: "Paid",
			},
			{
				id: "2",
				productName: "My Orders",
				sellerName: "seller2_fullname",
				status: "Paid",
			},
		],
	},
	{
		date: "September 20",
		items: [
			{
				id: "3",
				productName: "productName",
				sellerName: "seller1_fullname",
				status: "Delivered",
			},
			{
				id: "4",
				productName: "productName",
				sellerName: "seller2_fullname",
				status: "Delivered",
			},
		],
	},
];

export default function MyOrders() {
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
		},
	});

	const onSubmit = (data: FormValues) => {
		console.log(data);
		setActiveFilters(data);
		closeFiltersModal();
	};

	const handleItemClick = (id: string) => {
		router.push(`/user/my-orders/${id}`);
	};

	useEffect(() => {
		const newFilteredOrders = mockedOrders
			.map((orderGroup) => ({
				...orderGroup,
				items: orderGroup.items.filter((item) => {
					const matchesSearch = searchTerm
						? item.sellerName.toLowerCase().includes(searchTerm.toLowerCase())
						: true;

					const activeStatusFilters = [
						activeFilters.statusPaid,
						activeFilters.statusPrepared,
						activeFilters.statusShipped,
						activeFilters.statusDelivered,
					];

					const matchesStatus = activeStatusFilters.some(Boolean)
						? (activeFilters.statusPaid &&
								item.status === SalesStatusEnum.Paid) ||
							(activeFilters.statusPrepared &&
								item.status === SalesStatusEnum.Prepared) ||
							(activeFilters.statusShipped &&
								item.status === SalesStatusEnum.Shipped) ||
							(activeFilters.statusDelivered &&
								item.status === SalesStatusEnum.Delivered)
						: true;

					return matchesSearch && matchesStatus;
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
							{orderGroup.date}
						</h2>
						<div className="bg-white rounded-lg">
							{orderGroup.items.map((order, orderIndex) => (
								<>
									<OrderListItem
										key={`${order.productName}-${orderIndex}`}
										productName={order.productName}
										name={order.sellerName}
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
						Status
					</h3>
					<div className="flex flex-col gap-2">
						<>
							<CheckBox
								name={`status${SalesStatusEnum.Paid}`}
								label={SalesStatusEnum.Paid}
								control={control}
							/>
							<hr className="my-2 border-surface-primary-soft" />
							<CheckBox
								name={`status${SalesStatusEnum.Prepared}`}
								label={SalesStatusEnum.Prepared}
								control={control}
							/>
							<hr className="my-2 border-surface-primary-soft" />
							<CheckBox
								name={`status${SalesStatusEnum.Shipped}`}
								label={SalesStatusEnum.Shipped}
								control={control}
							/>
							<hr className="my-2 border-surface-primary-soft" />
							<CheckBox
								name={`status${SalesStatusEnum.Delivered}`}
								label={SalesStatusEnum.Delivered}
								control={control}
							/>
						</>
					</div>
					<Button type="submit" className="w-full !mt-6">
						Apply
					</Button>
				</form>
			</BottomModal>
		</ProfileOptionLayout>
	);
}
