"use client";

import { FunnelIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import type { OrderStatus } from "@prisma/client";
import Button from "@repo/ui/button";
import CheckBox from "@repo/ui/form/checkBox";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import OrderListItem from "~/app/_components/features/OrderListItem";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import BottomModal from "~/app/_components/ui/BottomModal";
import { useOrderFiltering } from "~/hooks/user/useOrderFiltering";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/react";
import { type FormValues, filtersSchema } from "~/types";

type OrderWithItems = RouterOutputs["order"]["getUserOrders"][number];

interface GroupedOrderItem {
	id: string;
	productName: string;
	sellerName: string;
	status: OrderStatus;
}

interface OrderGroup {
	date: string;
	items: GroupedOrderItem[];
}

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

export default function MyOrders() {
	const { t } = useTranslation();
	const router = useRouter();
	const { data: session, status } = useSession();
	const { data: orders, isLoading } = api.order.getUserOrders.useQuery(
		undefined,
		{
			enabled: !!session?.user,
		},
	);

	// Redirect to login if not authenticated
	React.useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth/signin");
		}
	}, [status, router]);

	const groupedOrders = React.useMemo(() => {
		if (!orders) return [];

		const grouped = orders.reduce((acc: OrderGroup[], order) => {
			const date = new Date(order.createdAt);
			const monthYear = date.toLocaleString("default", {
				month: "long",
				year: "numeric",
			});

			const existingGroup = acc.find((group) => group.date === monthYear);
			const orderItem = {
				id: order.id,
				productName: order.items[0]?.product.name ?? t("unknown_product"),
				sellerName: order.seller?.name ?? t("unknown_seller"),
				status: order.status,
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
		searchKey: "sellerName",
		filters: filtersDefaults,
	});

	const { control, handleSubmit } = useForm<FormValues>({
		resolver: zodResolver(filtersSchema),
		defaultValues: filtersDefaults,
	});

	const handleItemClick = (id: string) => {
		router.push(`/user/my-orders/${id}`);
	};

	// Show loading state while checking authentication
	if (status === "loading") {
		return (
			<ProfileOptionLayout title={t("my_orders")}>
				<div className="space-y-4">
					<div className="animate-pulse h-6 bg-gray-200 rounded w-1/4" />
					<div className="space-y-2">
						<div className="animate-pulse h-20 bg-gray-200 rounded" />
						<div className="animate-pulse h-20 bg-gray-200 rounded" />
					</div>
				</div>
			</ProfileOptionLayout>
		);
	}

	return (
		<ProfileOptionLayout title={t("my_orders")}>
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
										<OrderListItem
											productName={order.productName}
											name={order.sellerName ?? t("unknown_seller")}
											status={t(`order_status.${order.status.toLowerCase()}`)}
											onClick={() => handleItemClick(order.id)}
										/>
										{orderIndex < orderGroup.items.length - 1 && (
											<hr className="my-2 border-surface-primary-soft" />
										)}
									</React.Fragment>
								))}
							</div>
						</div>
					))
				) : (
					<div className="text-center py-8">
						<p className="text-gray-600">{t("no_orders_found")}</p>
					</div>
				)}
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
