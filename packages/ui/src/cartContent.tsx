"use client";

import { TrashIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useState } from "react";
import Button from "./button";
import { Text } from "./typography";

interface CartItem {
	id: string;
	product: {
		name: string;
		price: number;
		nftMetadata: string;
	};
	quantity: number;
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
	const [itemToDelete, setItemToDelete] = useState<string | null>(null);

	const getImageUrl = (nftMetadata: string): string => {
		try {
			const metadata = JSON.parse(nftMetadata) as { imageUrl: string };
			return metadata.imageUrl.startsWith("Qm")
				? `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${metadata.imageUrl}`
				: metadata.imageUrl;
		} catch {
			return "/images/default.webp";
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
									${(item.product.price * item.quantity).toFixed(2)}
								</Text>
							</div>
							<div className="flex items-center justify-between mt-1">
								<Text className="text-sm text-gray-500">
									${item.product.price.toFixed(2)} each
								</Text>
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
