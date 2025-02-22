"use client";

import {
	FunnelIcon,
	InformationCircleIcon,
	MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import Button from "@repo/ui/button";
import { useAccount, useProvider } from "@starknet-react/core";
import { useEffect, useState } from "react";
import type { Provider } from "starknet";
import OrderListItem from "~/app/_components/features/OrderListItem";
import OrderListPriceItem from "~/app/_components/features/OrderListPriceItem";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import {
	ContractsInterface,
	useCofiCollectionContract,
	useMarketplaceContract,
	useStarkContract,
} from "~/services/contractsInterface";
import { DeliveryMethod, SalesStatus } from "~/types";

import { useTranslation } from "react-i18next";

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

interface BlockchainEvent {
	name: string;
	data: string[];
	timestamp: number;
}

interface StarknetEvent {
	keys: string[];
	data: string[];
	block_number: number;
	transaction_hash: string;
}

export default function MyClaims() {
	const [OrdersToClaim, setOrdersToClaim] = useState<OrderGroup[]>([]);
	const [ClaimedOrders, setClaimedOrders] = useState<OrderGroup[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [MoneyToClaim, setMoneyToClaim] = useState(0);
	const [checked, setChecked] = useState(false);
	const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
	const { t } = useTranslation();

	const { provider } = useProvider();
	const starknetProvider = provider as Provider;
	const { address } = useAccount();
	const contracts = new ContractsInterface(
		useAccount(),
		useCofiCollectionContract(),
		useMarketplaceContract(),
		useStarkContract(),
		starknetProvider,
	);

	useEffect(() => {
		const fetchBlockchainData = async () => {
			if (!starknetProvider || !address || !contracts.marketplaceContract)
				return;

			try {
				// Get claim balance
				const balance = await contracts.get_claim_balance();
				setMoneyToClaim(Number(balance));

				// Get events for this seller
				const eventsResponse = await starknetProvider.getEvents({
					address: contracts.marketplaceContract.address,
					from_block: { block_number: 0 },
					to_block: "latest",
					chunk_size: 100,
					keys: [[contracts.marketplaceContract.address]],
				});

				// Convert events to our format
				const events: BlockchainEvent[] = (eventsResponse.events ?? []).map(
					(event: StarknetEvent) => ({
						name: event.keys[0] ?? "",
						data: event.data,
						timestamp: Date.now() / 1000, // Using current timestamp as fallback
					}),
				);

				// Process events into orders
				const processedOrders: BlockchainOrder[] = events
					.filter(
						(event) =>
							event.data.includes(address.toLowerCase()) &&
							(event.name === "PaymentSeller" || event.name === "BuyProduct"),
					)
					.map((event) => ({
						token_id: event.data[0] ?? "0",
						amount: event.data[1] ?? "0",
						price: event.data[2] ?? "0",
						timestamp: event.timestamp,
						claimed: event.name === "PaymentSeller",
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

				// Split into claimed and unclaimed orders
				const unclaimedOrders = groupedOrders
					.map((group) => ({
						...group,
						items: group.items.filter((item) => !item.claimed),
					}))
					.filter((group) => group.items.length > 0);

				const claimedOrders = groupedOrders
					.map((group) => ({
						...group,
						items: group.items.filter((item) => item.claimed),
					}))
					.filter((group) => group.items.length > 0);

				setOrdersToClaim(unclaimedOrders);
				setClaimedOrders(claimedOrders);
			} catch (error) {
				console.error("Error fetching blockchain data:", error);
			}
		};

		void fetchBlockchainData();
	}, [starknetProvider, address, contracts]);

	const openFiltersModal = () => {
		setIsFiltersModalOpen(true);
	};

	const handleClaim = async () => {
		if (!checked) {
			const total = await contracts.get_claim_balance();
			setMoneyToClaim(Number(total));
			setChecked(true);
			return;
		}
		try {
			console.log("claiming");
			const tx = await contracts.claim();
			alert(`Claimed success with tx: ${tx}`);
		} catch (error) {
			console.error("Error claiming:", error);
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
					onClick={() => handleClaim()}
				>
					{!checked
						? "Check balance"
						: `${t("recieve")} ${MoneyToClaim.toFixed(2)} USD`}
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
