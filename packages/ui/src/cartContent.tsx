"use client";

import { TrashIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "./button";
import { Text } from "./typography";

const MARKET_FEE_BPS = 5000; // 50%

interface CartItem {
	id: string;
	product: {
		name: string;
		price: number;
		nftMetadata: string;
	};
	quantity: number;
	is_grounded: boolean;
}

interface CartContentProps {
	items?: CartItem[];
	onRemoveItem?: (cartItemId: string) => void;
	translations?: {
		cartEmptyMessage: string;
		quantityLabel: string;
		removeConfirmationTitle?: string;
		removeConfirmationYes?: string;
		cancel?: string;
	};
}

function DeleteConfirmationModal({
	isOpen,
	onConfirm,
	onCancel,
	translations,
}: {
	isOpen: boolean;
	onConfirm: () => void;
	onCancel: () => void;
	translations: {
		removeConfirmationTitle?: string;
		removeConfirmationYes?: string;
		cancel?: string;
	};
}) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4 flex flex-col gap-4">
				<div className="h-[34px] flex items-center">
					<Text className="text-2xl font-bold text-content-title leading-[34px]">
						{translations.removeConfirmationTitle || "Remove item?"}
					</Text>
				</div>
				<Button
					onClick={onConfirm}
					variant="secondary"
					className="w-full h-[52px]"
				>
					{translations.removeConfirmationYes || "Yes, remove"}
				</Button>
				<Button
					onClick={onCancel}
					variant="primary"
					className="w-full h-[52px]"
				>
					{translations.cancel || "Cancel"}
				</Button>
			</div>
		</div>
	);
}

export function CartContent({
	items = [],
	onRemoveItem,
	translations = {
		cartEmptyMessage: "Your cart is empty",
		quantityLabel: "Quantity",
	},
}: CartContentProps) {
	const { t } = useTranslation();
	const [itemToDelete, setItemToDelete] = useState<string | null>(null);
	const calculateTotalPrice = (price: number): number => {
		const fee = (price * MARKET_FEE_BPS) / 10000;
		return price + fee;
	};

	const getImageUrl = (nftMetadata: string): string => {
		try {
			const metadata = JSON.parse(nftMetadata) as { imageUrl: string };
			const imageUrl = metadata.imageUrl;
			const IPFS_GATEWAY_URL = "https://gateway.pinata.cloud/ipfs/";
			
			if (!imageUrl) return "/images/cafe1.webp";
			
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
			return "/images/cafe1.webp";
		} catch {
			return "/images/cafe1.webp";
		}
	};

	const handleRemove = (cartItemId: string) => {
		setItemToDelete(cartItemId);
	};

	const confirmDelete = () => {
		if (itemToDelete && onRemoveItem) {
			onRemoveItem(itemToDelete);
			setItemToDelete(null);
		}
	};

	const cancelDelete = () => {
		setItemToDelete(null);
	};

	if (items.length === 0) {
		return (
			<div className="py-8 text-center text-gray-500">
				{translations.cartEmptyMessage}
			</div>
		);
	}

	return (
		<>
			<div className="space-y-4">
				{items.map((item) => (
					<div
						key={item.id}
						className="py-3 flex items-start gap-3 border-b border-surface-primary-soft last:border-b-0"
					>
						<div className="relative flex-shrink-0">
							<Image
								src={getImageUrl(item.product.nftMetadata)}
								alt={item.product.name}
								width={64}
								height={64}
								className="rounded-lg object-cover bg-gray-100"
							/>
							<div className="absolute -top-2 -right-2 bg-primary-default text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
								{item.quantity}
							</div>
						</div>
						<div className="flex-1 min-w-0">
							<div className="flex justify-between items-start gap-2">
								<Text className="font-medium text-gray-900 truncate">
									{item.product.name}
								</Text>
								<Text className="font-semibold whitespace-nowrap">
									${(calculateTotalPrice(item.product.price) * item.quantity).toFixed(2)}
								</Text>
							</div>
							<div className="flex items-center justify-between mt-1">
								{/* per-item price hidden as we only show total */}
								{onRemoveItem && (
									<button
										type="button"
										onClick={() => handleRemove(item.id)}
										className="text-red-500 hover:text-red-600 p-1 -m-1"
										aria-label={`Remove ${item.product.name} from cart`}
									>
										<TrashIcon className="h-4 w-4" />
									</button>
								)}
							</div>
							<div>
								<Text className="text-sm text-gray-500">
									{item.is_grounded ? t("coffee_type.bean") : t("coffee_type.grounded")}
								</Text>
							</div>
						</div>
					</div>
				))}
			</div>

			<DeleteConfirmationModal
				isOpen={itemToDelete !== null}
				onConfirm={confirmDelete}
				onCancel={cancelDelete}
				translations={translations}
			/>
		</>
	);
}
