import type { OrderStatus } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";
// import { SalesStatus } from "~/types";

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
					([_key, value]) => value,
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
