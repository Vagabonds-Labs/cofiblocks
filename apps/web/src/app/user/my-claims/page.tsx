"use client";

import {
	InformationCircleIcon,
} from "@heroicons/react/24/solid";
import Button from "@repo/ui/button";
import { useState } from "react";
import OrderListPriceItem from "~/app/_components/features/OrderListPriceItem";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import { DeliveryMethod, SalesStatus } from "~/types";
import { api } from "~/trpc/react";

import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useSession } from "next-auth/react";

// Interface for blockchain events
interface BlockchainOrder {
	token_id: string;
	amount: string;
	price: string;
	timestamp: number;
	claimed: boolean;
}

interface OrderItem {
	id: string;
	productName: string;
	buyerName: string;
	status: SalesStatus;
	delivery: DeliveryMethod;
	price: number;
	claimed: boolean;
}

interface OrderGroup {
	date: string;
	items: OrderItem[];
}

export default function MyClaims() {
	const [OrdersToClaim, setOrdersToClaim] = useState<OrderGroup[]>([]);
	const [MoneyToClaim, setMoneyToClaim] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [isFetching, setIsFetching] = useState(false);
	const [isChecked, setIsChecked] = useState(false);
	const { t } = useTranslation();
	const router = useRouter();
	const { data: session } = useSession();

	const fetchBlockchainData = async () => {

		setIsFetching(true);
		try {
			// Get claim balance
			const isProducer = session?.user?.role === "COFFEE_PRODUCER";
			if (isProducer) {
				const balance = await api.distribution.getclaimBalanceProducer.useQuery();
				setMoneyToClaim(Number(balance));
			} else {
				const balance = await api.distribution.getclaimBalanceCoffeeLover.useQuery();
				setMoneyToClaim(Number(balance));
			}

			const { data: events = [] } = await api.marketplace.getEvents.useQuery();
			const { data: userAddress } = await api.user.getUserAddress.useQuery();
			if (!userAddress) {
				throw new Error("User address not found");
			}

			// Process events into orders
			const processedOrders: BlockchainOrder[] = events
				.filter(
					(event) =>
						event.data.includes(userAddress.toLowerCase()) &&
						event.name === "BuyProduct",
				)
				.map((event) => ({
					token_id: event.data[0] ?? "0",
					amount: event.data[1] ?? "0",
					price: event.data[2] ?? "0",
					timestamp: event.timestamp,
					claimed: false,
				}));

			// Group orders by month
			const groupedOrders = processedOrders.reduce<OrderGroup[]>(
				(acc, order) => {
					const date = new Date(order.timestamp * 1000);
					const monthYear = date.toLocaleString("default", {
						month: "long",
						year: "numeric",
					});

					const orderItem: OrderItem = {
						id: order.token_id,
						productName: `Product #${order.token_id}`,
						buyerName: "Anonymous Buyer",
						status: SalesStatus.Delivered,
						delivery: DeliveryMethod.Address,
						price: Number(order.price) / 1e18,
						claimed: order.claimed,
					};

					const existingGroup = acc.find((group) => group.date === monthYear);
					if (existingGroup) {
						existingGroup.items.push(orderItem);
					} else {
						acc.push({
							date: monthYear,
							items: [orderItem],
						});
					}
					return acc;
				},
				[],
			);

			setOrdersToClaim([]);
			setIsChecked(true);
		} catch (error) {
			console.error("Error fetching blockchain data:", error);
			toast.error(t("error_fetching_data"));
			setIsChecked(false);
			setMoneyToClaim(0);
			setOrdersToClaim([]);
		} finally {
			setIsFetching(false);
		}
	};

	const handleClaim = async () => {
		if (isLoading || MoneyToClaim <= 0) return;

		try {
			setIsLoading(true);
			const isProducer = session?.user?.role === "COFFEE_PRODUCER";
			if (isProducer) {
				const tx = await api.marketplace.claimProducer.useMutation();
			} else {
				const tx = await api.marketplace.claimConsumer.useMutation();
			}
			toast.success(t("status_updated"));
			setMoneyToClaim(0);
			setIsChecked(false);
			setOrdersToClaim([]);
			router.refresh();
		} catch (error) {
			console.error("Error claiming:", error);
			toast.error(t("error_updating_status"));
		} finally {
			setIsLoading(false);
		}
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
				{isFetching ? (
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 rounded w-32 mb-2" />
						<div className="h-6 bg-gray-200 rounded w-24" />
					</div>
				) : isChecked ? (
					<>
						<div>
							<h1 className="text-2xl font-semibold text-gray-800">
								{t("amount_with_currency", { amount: MoneyToClaim.toFixed(2) })}
							</h1>
						</div>
						<div className="text-l text-green-600">
							~
							{t("amount_with_currency", {
								amount: (Number(MoneyToClaim) * 520).toFixed(2),
							})}{" "}
							CRC
						</div>
					</>
				) : (
					<div className="text-gray-500 italic">
						{t("click_check_to_see_balance")}
					</div>
				)}
			</div>
			<hr className="border-t border-gray-300 my-4" />
			<div className="mb-6">
				{isFetching ? (
					<div className="animate-pulse space-y-4">
						<div className="h-10 bg-gray-200 rounded" />
						<div className="h-10 bg-gray-200 rounded" />
						<div className="h-10 bg-gray-200 rounded" />
					</div>
				) : isChecked && OrdersToClaim.length > 0 ? (
					OrdersToClaim.map((orderGroup, index) => (
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
					))
				) : null}
			</div>
			<div className="mb-6 space-y-4">
				{isChecked && MoneyToClaim > 0 ? (
					<Button
						className="mx-auto w-[90%] h-15 px-2"
						onClick={() => handleClaim()}
						disabled={isLoading}
					>
						{isLoading
							? t("claiming")
							: t("amount_with_currency", { amount: MoneyToClaim.toFixed(2) })}
					</Button>
				) : (
					<Button
						className="mx-auto w-[90%] h-15 px-2"
						onClick={() => fetchBlockchainData()}
						disabled={isFetching}
					>
						{isFetching ? t("checking") : t("check_balance")}
					</Button>
				)}
			</div>
		</ProfileOptionLayout>
	);
}
