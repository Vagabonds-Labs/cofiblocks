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
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import BottomModal from "~/app/_components/ui/BottomModal";
import { useOrderFiltering } from "~/hooks/user/useOrderFiltering";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/react";
import { type FormValues, filtersSchema } from "~/types";

type ProducerOrderItem = RouterOutputs["order"]["getProducerOrders"][number];

// type _OrderWithItems = RouterOutputs["order"]["getProducerOrders"][number];

interface OrderItem {
	id: string;
	productName: string;
	buyerName: string;
	status: OrderStatus;
	total: number;
	productImage: string;
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

export default function MySales() {
	const { t } = useTranslation();
	const router = useRouter();
	const { data: ordersItems, isLoading } = api.order.getProducerOrders.useQuery();

	const filtersDefaults = React.useMemo(() => ({
		statusPending: false,
		statusCompleted: false,
		statusCancelled: false,
	}), []);

	const totalSalesAmount = React.useMemo(() => {
		if (!ordersItems){
			return 0;
		}
		const total = ordersItems?.reduce((total: number, item: { price: number; quantity: number }) => {
			return total + item.price * item.quantity;
		}, 0);
		return total;
	}, [ordersItems]);

	// Helper function to get product image from metadata
	const getProductImageUrl = (nftMetadata: unknown) => {
		if (!nftMetadata) return "/images/cafe2.webp";
		
		let metadata: { imageUrl?: string } | null = null;
		try {
			metadata = typeof nftMetadata === "string" ? JSON.parse(nftMetadata) as { imageUrl?: string } : nftMetadata as { imageUrl?: string };
		} catch {
			return "/images/cafe2.webp";
		}

		const imageUrl = metadata?.imageUrl;
		if (!imageUrl || typeof imageUrl !== "string") return "/images/cafe2.webp";

		const IPFS_GATEWAY_URL = "https://gateway.pinata.cloud/ipfs/";
		
		// If it's already a full URL, use it
		if (imageUrl.startsWith("http")) return imageUrl;
		
		// If it's an IPFS hash, construct the gateway URL
		if (imageUrl.startsWith("Qm")) {
			return `${IPFS_GATEWAY_URL}${imageUrl}`;
		}
		
		// If it's an IPFS URL, extract hash and construct gateway URL
		if (imageUrl.startsWith("ipfs://")) {
			const hash = imageUrl.replace("ipfs://", "");
			return `${IPFS_GATEWAY_URL}${hash}`;
		}
		
		// Fallback to default image
		return "/images/cafe2.webp";
	};

	const groupedOrders = React.useMemo((): OrderGroup[] => {
		if (!ordersItems) return [];

		const grouped = ordersItems.reduce((acc: OrderGroup[], item: ProducerOrderItem) => {
			const date = new Date(item.order.createdAt);
			const monthYear = date.toLocaleString("default", {
				month: "long",
				year: "numeric",
			});

			const existingGroup = acc.find((group) => group.date === monthYear);
			const orderItem: OrderItem = {
				id: item.id,
				productName: item.product.name ?? t("unknown_product"),
				buyerName: item.order.user?.email ?? t("unknown_buyer"),
				status: mapOrderStatusToSalesStatus(item.order.status),
				total: item.price * item.quantity,
				productImage: getProductImageUrl(item.product.nftMetadata),
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
		}, [] as OrderGroup[]);

		return grouped.sort(
			(a: OrderGroup, b: OrderGroup) => new Date(b.date).getTime() - new Date(a.date).getTime(),
		);
	}, [ordersItems, t]);

	// Memoize the orders transformation to prevent infinite re-renders
	const filteredOrdersForHook = React.useMemo(() => {
		return groupedOrders.map(group => ({
			...group,
			items: group.items.map(item => ({
				id: item.id,
				productName: item.productName,
				buyerName: item.buyerName,
				status: item.status,
				total: item.total,
			}))
		}));
	}, [groupedOrders]);

	const {
		searchTerm,
		setSearchTerm,
		isFiltersModalOpen,
		openFiltersModal,
		closeFiltersModal,
		filteredOrders,
		applyFilters,
	} = useOrderFiltering({
		orders: filteredOrdersForHook,
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
				{/* Sales Summary Card - Mobile Optimized */}
				<div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
					<div className="flex flex-col space-y-4">
						{/* Total Sales Amount Section */}
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-medium text-gray-600">
								{t("total_sales_amount")}
							</h2>
							<div className="bg-green-50 border border-green-200 rounded-lg p-3">
								<span className="text-2xl font-bold text-green-600">
									${totalSalesAmount.toFixed(2)}
								</span>
								<span className="text-sm font-medium text-green-500 ml-1">
									{t("usd")}
								</span>
							</div>
						</div>

						{/* Claim Rewards Button */}
						<button
							type="button"
							onClick={() => router.push("/user-profile")}
							className="flex items-center justify-between w-full p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors border border-yellow-200"
						>
							<div className="flex flex-col">
								<span className="text-yellow-900 font-medium">
									{t("claim_rewards")}
								</span>
								<span className="text-yellow-700 text-sm">
									{t("available_to_claim")}
								</span>
							</div>
							<ArrowRightIcon className="w-5 h-5 text-yellow-600" />
						</button>
					</div>
				</div>

				{/* Orders List with Sales Information */}
				<div className="space-y-6">
					<div className="flex space-x-3">
						<div className="flex-grow relative">
							<MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
							<input
								type="text"
								placeholder={t("search_placeholder")}
								className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<Button
							className="px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 border-0"
							type="button"
							onClick={openFiltersModal}
						>
							<FunnelIcon className="w-5 h-5" />
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
						// Filter the original groupedOrders based on filteredOrders
						groupedOrders.filter(group => 
							filteredOrders.some(filteredGroup => filteredGroup.date === group.date)
						).map((orderGroup: OrderGroup, index: number) => (
							<div key={`${orderGroup.date}-${index}`} className="space-y-4">
								<h2 className="text-lg font-semibold text-gray-500 mb-4 px-2">
									{orderGroup.date}
								</h2>
								<div className="space-y-3">
									{orderGroup.items.map((order: OrderItem, orderIndex: number) => (
										<div
											key={`${order.id}-${orderIndex}`}
											className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
											onClick={() => handleItemClick(order.id)}
											onKeyDown={(e) => {
												if (e.key === 'Enter' || e.key === ' ') {
													e.preventDefault();
													handleItemClick(order.id);
												}
											}}
											role="button"
											tabIndex={0}
										>
											{/* Mobile-optimized layout */}
											<div className="flex items-start space-x-4">
												{/* Product Image */}
												<div className="flex-shrink-0">
													<Image
														src={order.productImage}
														alt={t("product_image_alt", { productName: order.productName })}
														width={64}
														height={64}
														className="w-16 h-16 rounded-lg object-cover border border-gray-100"
													/>
												</div>
												
												{/* Product Info */}
												<div className="flex-grow min-w-0">
													<div className="flex flex-col space-y-2">
														<div>
															<h3 className="font-semibold text-gray-900 text-base leading-tight">
																{order.productName}
															</h3>
															<p className="text-sm text-gray-600 mt-1 break-all">
																{order.buyerName ?? t("unknown_buyer")}
															</p>
														</div>
														
														{/* Status and Price Row */}
														<div className="flex items-center justify-between pt-2">
															<span
																className={`px-3 py-1 text-xs font-medium rounded-full ${
																	order.status === "COMPLETED"
																		? "bg-green-100 text-green-700"
																		: order.status === "CANCELLED"
																			? "bg-red-100 text-red-700"
																			: order.status === "FAILED"
																				? "bg-red-100 text-red-700"
																				: order.status === "PAID"
																					? "bg-blue-100 text-blue-700"
																					: "bg-yellow-100 text-yellow-700"
																}`}
															>
																{t(`order_status.${order.status.toLowerCase()}`)}
															</span>
															<div className="text-center">
																<span className="font-bold text-gray-900 text-lg">
																	${(order.total ?? 0).toFixed(2)}
																</span>
																<span className="text-sm text-gray-500 ml-1">
																	{t("usd")}
																</span>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
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
