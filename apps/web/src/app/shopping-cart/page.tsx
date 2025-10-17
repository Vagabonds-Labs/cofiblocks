"use client";

import { ArrowLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useSetAtom } from "jotai";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { type CartItem, cartItemsAtom } from "~/store/cartAtom";
import { api } from "~/trpc/react";

const MARKET_FEE_BPS = 5000; // 50%

interface DeleteModalProps {
	isOpen: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

function DeleteConfirmationModal({
	isOpen,
	onConfirm,
	onCancel,
}: DeleteModalProps) {
	const { t } = useTranslation();
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4 flex flex-col gap-4">
				<div className="h-[34px] flex items-center">
					<h3 className="text-2xl font-bold text-content-title leading-[34px]">
						{t("remove_confirmation_title")}
					</h3>
				</div>
				<button
					type="button"
					onClick={onConfirm}
					className="w-full h-[52px] bg-surface-secondary-default rounded-lg border border-surface-secondary-default flex justify-center items-center"
				>
					<span className="text-content-title text-base font-normal">
						{t("remove_confirmation_yes")}
					</span>
				</button>
				<button
					type="button"
					onClick={onCancel}
					className="w-full h-[52px] bg-surface-primary-soft rounded-lg border border-surface-primary-soft flex justify-center items-center"
				>
					<span className="text-content-title text-base font-normal">
						{t("cancel")}
					</span>
				</button>
			</div>
		</div>
	);
}

interface NftMetadata {
	description: string;
	imageUrl: string;
	imageAlt: string;
	region?: string;
	farmName?: string;
	strength?: string;
}

export default function ShoppingCart() {
	const router = useRouter();
	const { t } = useTranslation();
	const [itemToDelete, setItemToDelete] = useState<string | null>(null);
	const setCartItems = useSetAtom(cartItemsAtom);
	// Get cart data from server
	const { data: cart, refetch: refetchCart } = api.cart.getUserCart.useQuery();

	// Sync server cart data with local atom
	useEffect(() => {
		if (cart?.items) {
			const cartItems: CartItem[] = cart.items.map((item) => ({
				id: item.id,
				tokenId: item.product.tokenId,
				name: item.product.name,
				quantity: item.quantity,
				price: item.product.price,
				imageUrl: getImageUrl(item.product.nftMetadata),
				is_grounded: item.is_grounded,
			}));
			setCartItems(cartItems);
		}
	}, [cart?.items, setCartItems]);

	const { mutate: removeFromCart } = api.cart.removeFromCart.useMutation({
		onSuccess: () => {
			void refetchCart();
		},
	});
	const handleRemove = (cartItemId: string) => {
		setItemToDelete(cartItemId);
	};

	const confirmDelete = () => {
		if (itemToDelete) {
			removeFromCart({ cartItemId: itemToDelete });
			setItemToDelete(null);
		}
	};

	const cancelDelete = () => {
		setItemToDelete(null);
	};

	const calculateTotalPrice = (price: number): number => {
		const fee = (price * MARKET_FEE_BPS) / 10000;
		const total = price + fee;
		return Math.round(total * 100) / 100;
	};

	const totalPrice =
		cart?.items.reduce(
			(total, item) =>
				total + calculateTotalPrice(item.product.price) * item.quantity,
			0,
		) ?? 0;

	const getImageUrl = (nftMetadata: unknown): string => {
		if (typeof nftMetadata !== "string") return "/images/cafe1.webp";
		try {
			const metadata = JSON.parse(nftMetadata) as NftMetadata;
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

	const hasItems = Boolean(cart?.items && cart.items.length > 0);

	const handleCheckout = () => {
		router.push("/checkout");
	};

	return (
		<div className="max-w-md mx-auto bg-white min-h-screen">
			<div className="flex items-center gap-3 p-4 mb-8">
				<button
					type="button"
					onClick={() => router.push("/marketplace")}
					className="hover:bg-gray-100 p-1 rounded-full"
					aria-label={t("aria_label_go_back")}
				>
					<ArrowLeftIcon className="h-6 w-6" />
				</button>
				<h1 className="text-xl font-semibold">{t("marketplace")}</h1>
			</div>

			<div className="px-4">
				{!hasItems ? (
					<div className="py-8 text-center text-gray-500">
						{t("cart_empty_message")}
					</div>
				) : (
					cart?.items.map((item) => (
						<div
							key={item.id}
							className="py-4 flex items-center justify-between border-b"
						>
							<div className="flex items-center gap-3">
								<Image
									src={getImageUrl(item.product.nftMetadata)}
									alt={item.product.name}
									width={48}
									height={48}
									className="rounded-lg object-cover bg-gray-100"
								/>
								<div>
									<h3 className="font-medium text-gray-900">
										{t(item.product.name)}
									</h3>
									<p className="text-gray-400 text-sm">
										{t("quantity_label")}: {item.quantity}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<span className="text-gray-900">
									{(calculateTotalPrice(item.product.price) * item.quantity).toFixed(2)} USD
								</span>
								<button
									type="button"
									onClick={() => handleRemove(item.id)}
									className="text-red-500 hover:text-red-600"
									aria-label={`Remove ${item.product.name} from cart`}
								>
									<TrashIcon className="h-5 w-5" />
								</button>
							</div>
						</div>
					))
				)}
			</div>

			{hasItems && (
				<>
					<div className="px-4 py-4">
						<div className="flex items-center justify-between">
							<span className="font-semibold text-gray-900">
								{t("total_label")}
							</span>
							<span className="font-semibold text-gray-900">
|								{totalPrice.toFixed(2)} USD
							</span>
						</div>
					</div>
					<div className="fixed bottom-0 left-0 right-0 bg-white max-w-md mx-auto px-4 pb-4 pt-2">
						<button
							type="button"
							onClick={() => handleCheckout()}
							className={`w-full py-3.5 px-4 bg-surface-secondary-default rounded-lg border border-surface-secondary-defaul flex justify-center items-center ${!hasItems ? "opacity-50 cursor-not-allowed" : ""}`}
							disabled={!hasItems}
						>
							<span className="text-[#1F1F20] text-base font-normal">
								{t("buy_button")}
							</span>
						</button>
					</div>
				</>
			)}

			<DeleteConfirmationModal
				isOpen={itemToDelete !== null}
				onConfirm={confirmDelete}
				onCancel={cancelDelete}
			/>
		</div>
	);
}
