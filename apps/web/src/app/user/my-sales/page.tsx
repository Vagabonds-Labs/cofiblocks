"use client";

import {
	ArrowRightIcon,
	FunnelIcon,
	MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import type { OrderStatus } from "@prisma/client";
import Button from "@repo/ui/button";
import CheckBox from "@repo/ui/form/checkBox";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import OrderListItem from "~/app/_components/features/OrderListItem";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import BottomModal from "~/app/_components/ui/BottomModal";
import { useOrderFiltering } from "~/hooks/user/useOrderFiltering";
import { useTranslation } from "~/i18n";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/react";
import { type FormValues, filtersSchema } from "~/types";

type OrderWithItems = RouterOutputs["order"]["getProducerOrders"][number];

interface OrderItem {
	id: string;
	productName: string;
	buyerName: string;
	status: OrderStatus;
	total: number;
}

interface OrderGroup {
	date: string;
	items: OrderItem[];
}

const mapOrderStatusToSalesStatus = (status: string): OrderStatus => {
	switch (status) {
		case "PENDING":
			return "PENDING";
		case "COMPLETED":
			return "COMPLETED";
		case "CANCELLED":
			return "CANCELLED";
		default:
			return "PENDING";
	}
};

const statusOptions = [
	{ key: "statusPending", label: "order_status.pending" },
	{ key: "statusCompleted", label: "order_status.completed" },
	{ key: "statusCancelled", label: "order_status.cancelled" },
] as const;

const filtersDefaults = {
	statusPending: false,
	statusCompleted: false,
	statusCancelled: false,
};

export default function MySales() {
	const { t } = useTranslation();
	const router = useRouter();
	const { data: orders, isLoading } = api.order.getProducerOrders.useQuery();

	const totalSalesAmount = React.useMemo(() => {
		if (!orders) return 0;
		return orders.reduce((total, order) => {
			const orderTotal = order.items.reduce((itemTotal, item) => {
				return itemTotal + item.product.price * item.quantity;
			}, 0);
			return total + orderTotal;
		}, 0);
	}, [orders]);

	const groupedOrders = React.useMemo(() => {
		if (!orders) return [];

		const grouped = orders.reduce((acc: OrderGroup[], order) => {
			const date = new Date(order.createdAt);
			const monthYear = date.toLocaleString("default", {
				month: "long",
				year: "numeric",
			});

			const existingGroup = acc.find((group) => group.date === monthYear);
			const orderItem: OrderItem = {
				id: order.id,
				productName: order.items[0]?.product.name ?? t("unknown_product"),
				buyerName: order.user?.name ?? t("unknown_buyer"),
				status: mapOrderStatusToSalesStatus(order.status),
				total: order.items.reduce(
					(total, item) => total + item.product.price * item.quantity,
					0,
				),
			};

			if (existingGroup) {
				existingGroup.items.push(orderItem);
			} else {
				acc.push({
					date: monthYear,
					items: [orderItem],
				});
			}

			return acc;
		}, []);

		return grouped.sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
		);
	}, [orders, t]);

	const {
		searchTerm,
		setSearchTerm,
		isFiltersModalOpen,
		openFiltersModal,
		closeFiltersModal,
		filteredOrders,
		applyFilters,
	} = useOrderFiltering({
		orders: groupedOrders,
		searchKey: "buyerName",
		filters: filtersDefaults,
	});

	const { control, handleSubmit } = useForm<FormValues>({
		resolver: zodResolver(filtersSchema),
		defaultValues: filtersDefaults,
	});

	const handleItemClick = (id: string) => {
		router.push(`/user/my-sales/${id}`);
	};

	return (
		<ProfileOptionLayout title={t("my_sales")}>
			<div className="space-y-6">
				{/* Sales Summary Card */}
				<div className="bg-white rounded-lg p-6">
					<div className="flex flex-col space-y-4">
						<div className="flex justify-between items-center">
							<h2 className="text-xl font-semibold text-content-title">
								{t("total_sales_amount")}
							</h2>
							<span className="text-2xl font-bold text-content-title">
								${totalSalesAmount.toFixed(2)} USD
							</span>
						</div>

						<button
							type="button"
							onClick={() => router.push("/user/my-claims")}
							className="flex items-center justify-between w-full p-4 bg-surface-primary-soft rounded-lg hover:bg-surface-primary-hover transition-colors"
						>
							<div className="flex flex-col">
								<span className="text-content-title font-medium">
									{t("claim_rewards")}
								</span>
								<span className="text-content-body-soft text-sm">
									{t("available_to_claim")}
								</span>
							</div>
							<ArrowRightIcon className="w-5 h-5 text-content-body-default" />
						</button>
					</div>
				</div>

				{/* Orders List with Sales Information */}
				<div className="bg-white rounded-lg p-6 space-y-6">
					<div className="flex space-x-2">
						<div className="flex-grow relative">
							<MagnifyingGlassIcon className="w-6 h-6 absolute left-3 top-1/2 transform -translate-y-1/2 text-content-body-default" />
							<input
								type="text"
								placeholder={t("search_placeholder")}
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

					{isLoading ? (
						<div className="space-y-4">
							<div className="animate-pulse h-6 bg-gray-200 rounded w-1/4" />
							<div className="space-y-2">
								<div className="animate-pulse h-20 bg-gray-200 rounded" />
								<div className="animate-pulse h-20 bg-gray-200 rounded" />
							</div>
						</div>
					) : filteredOrders.length > 0 ? (
						filteredOrders.map((orderGroup, index) => (
							<div key={`${orderGroup.date}-${index}`}>
								<h2 className="text-lg font-semibold text-gray-500 mb-2">
									{orderGroup.date}
								</h2>
								<div className="bg-white rounded-lg">
									{orderGroup.items.map((order, orderIndex) => (
										<React.Fragment key={`${order.id}-${orderIndex}`}>
											<div className="flex items-center justify-between py-4">
												<div className="flex-grow">
													<OrderListItem
														productName={order.productName}
														name={order.buyerName ?? t("unknown_buyer")}
														status={t(
															`order_status.${order.status.toLowerCase()}`,
														)}
														onClick={() => handleItemClick(order.id)}
													/>
												</div>
												<div className="flex flex-col items-end ml-4">
													<span className="font-medium text-content-title">
														${(order.total ?? 0).toFixed(2)} USD
													</span>
													<span className="text-sm text-content-body-soft">
														{orderGroup.date}
													</span>
												</div>
											</div>
											{orderIndex < orderGroup.items.length - 1 && (
												<hr className="border-surface-primary-soft" />
											)}
										</React.Fragment>
									))}
								</div>
							</div>
						))
					) : (
						<div className="text-center py-8">
							<p className="text-gray-600">{t("no_sales_found")}</p>
						</div>
					)}
				</div>
			</div>

			<BottomModal isOpen={isFiltersModalOpen} onClose={closeFiltersModal}>
				<form onSubmit={handleSubmit(applyFilters)} className="space-y-4">
					<h3 className="text-xl font-semibold my-4 text-content-title">
						{t("status")}
					</h3>
					<div className="flex flex-col gap-2">
						{statusOptions.map((status) => (
							<React.Fragment key={status.key}>
								<CheckBox
									name={status.key}
									label={t(status.label)}
									control={control}
								/>
								<hr className="my-2 border-surface-primary-soft" />
							</React.Fragment>
						))}
					</div>
					<Button type="submit" className="w-full !mt-6">
						{t("apply")}
					</Button>
				</form>
			</BottomModal>
		</ProfileOptionLayout>
	);
}
