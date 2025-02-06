import { useEffect, useState } from "react";
import { DeliveryMethod, type Order, SalesStatus } from "~/types";

interface UseOrderFilteringProps {
	orders: Order[];
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
	const [activeFilters, setActiveFilters] =
		useState<Record<string, boolean>>(filters);

	const openFiltersModal = () => setIsFiltersModalOpen(true);
	const closeFiltersModal = () => setIsFiltersModalOpen(false);

	const applyFilters = (newFilters: Record<string, boolean>) => {
		setActiveFilters(newFilters);
		closeFiltersModal();
	};

	useEffect(() => {
		const newFilteredOrders = orders
			.map((orderGroup) => ({
				...orderGroup,
				items: orderGroup.items.filter((item) => {
					const matchesSearch = searchTerm
						? item[searchKey]?.toLowerCase().includes(searchTerm.toLowerCase())
						: true;

					const activeStatusFilters = [
						activeFilters.statusPaid,
						activeFilters.statusPrepared,
						activeFilters.statusShipped,
						activeFilters.statusDelivered,
					];

					const matchesStatus = activeStatusFilters.some(Boolean)
						? [
								{
									filter: activeFilters.statusPaid,
									status: SalesStatus.Paid,
								},
								{
									filter: activeFilters.statusPrepared,
									status: SalesStatus.Prepared,
								},
								{
									filter: activeFilters.statusShipped,
									status: SalesStatus.Shipped,
								},
								{
									filter: activeFilters.statusDelivered,
									status: SalesStatus.Delivered,
								},
							].some(({ filter, status }) => filter && item.status === status)
						: true;

					const activeDeliveryFilters = [
						activeFilters.deliveryAddress,
						activeFilters.deliveryMeetup,
					];

					const matchesDelivery = activeDeliveryFilters.some(Boolean)
						? [
								{
									filter: activeFilters.deliveryAddress,
									deliveryMethod: DeliveryMethod.Address,
								},
								{
									filter: activeFilters.deliveryMeetup,
									deliveryMethod: DeliveryMethod.Meetup,
								},
							].some(
								({ filter, deliveryMethod }) =>
									filter && item.delivery === deliveryMethod,
							)
						: true;

					return matchesSearch && matchesStatus && matchesDelivery;
				}),
			}))
			.filter((orderGroup) => orderGroup.items.length > 0);
		if (!searchTerm && !Object.values(activeFilters).some(Boolean)) {
			setFilteredOrders(orders);
		} else {
			setFilteredOrders(newFilteredOrders);
		}
	}, [orders, searchKey, searchTerm, activeFilters]);

	return {
		searchTerm,
		setSearchTerm,
		isFiltersModalOpen,
		openFiltersModal,
		closeFiltersModal,
		activeFilters,
		filteredOrders,
		applyFilters,
	};
}
