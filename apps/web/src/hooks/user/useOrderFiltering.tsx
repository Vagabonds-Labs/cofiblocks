import type { OrderStatus } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";
import { SalesStatus } from "~/types";

interface OrderGroup {
	date: string;
	items: OrderItem[];
}

interface OrderItem {
	id: string;
	productName: string;
	buyerName?: string;
	sellerName?: string;
	status: OrderStatus;
	total?: number;
}

interface UseOrderFilteringProps {
	orders: OrderGroup[];
	searchKey: "sellerName" | "buyerName";
	filters: Record<string, boolean>;
}

const _mapOrderStatusToSalesStatus = (status: OrderStatus): SalesStatus => {
	switch (status) {
		case "PENDING":
			return SalesStatus.Paid;
		case "COMPLETED":
			return SalesStatus.Delivered;
		case "CANCELLED":
			return SalesStatus.Paid; // TODO: Add proper cancelled status
		default:
			return SalesStatus.Paid;
	}
};

export function useOrderFiltering({
	orders,
	searchKey,
	filters,
}: UseOrderFilteringProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
	const [filteredOrders, setFilteredOrders] = useState(orders);

	useEffect(() => {
		const filtered = orders.map((orderGroup) => ({
			...orderGroup,
			items: orderGroup.items.filter((item) => {
				const searchMatch = item[searchKey]
					?.toLowerCase()
					.includes(searchTerm.toLowerCase());

				const statusFilters = Object.entries(filters).filter(
					([key, value]) => value,
				);

				if (statusFilters.length === 0) {
					return searchMatch;
				}

				const statusMatch = statusFilters.some(([key]) => {
					const status = key.replace("status", "").toUpperCase() as OrderStatus;
					return item.status === status;
				});

				return searchMatch && statusMatch;
			}),
		}));

		const nonEmptyGroups = filtered.filter(
			(orderGroup) => orderGroup.items.length > 0,
		);

		setFilteredOrders(nonEmptyGroups);
	}, [orders, searchTerm, filters, searchKey]);

	const openFiltersModal = useCallback(() => {
		setIsFiltersModalOpen(true);
	}, []);

	const closeFiltersModal = useCallback(() => {
		setIsFiltersModalOpen(false);
	}, []);

	const applyFilters = useCallback(
		(_values: Record<string, boolean>) => {
			closeFiltersModal();
		},
		[closeFiltersModal],
	);

	return {
		searchTerm,
		setSearchTerm,
		isFiltersModalOpen,
		openFiltersModal,
		closeFiltersModal,
		filteredOrders,
		applyFilters,
	};
}
