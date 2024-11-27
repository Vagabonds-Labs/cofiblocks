"use client";

import { ArrowDownIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import Button from "@repo/ui/button"; // Updated import
import { Separator } from "@repo/ui/separator";
import { useAtomValue } from "jotai";
import Image from "next/image";
import Link from "next/link";
import { cartItemsAtom } from "~/store/cartAtom";
import type { CartItem } from "~/store/cartAtom";

interface OrderReviewProps {
	onNext: () => void;
	deliveryAddress: {
		street: string;
		apartment: string;
		city: string;
		zipCode: string;
	};
	deliveryMethod: string;
	deliveryPrice: number;
}

export default function OrderReview({
	onNext,
	deliveryAddress,
	deliveryMethod,
	deliveryPrice,
}: OrderReviewProps) {
	const cartItems = useAtomValue(cartItemsAtom);

	const productPrice = cartItems.reduce(
		(total, item) => total + item.price * item.quantity,
		0,
	);
	const totalPrice = productPrice + deliveryPrice;

	return (
		<div className="min-h-screen bg-white">
			<div className="p-4">
				<h1 className="text-xl font-medium mb-6">Review your order</h1>

				{cartItems.map((item: CartItem) => (
					<div key={item.id} className="space-y-6 mb-6">
						<div className="flex items-start gap-4">
							<Image
								src={item.imageUrl}
								alt={item.name}
								width={80}
								height={80}
								className="rounded-lg object-cover bg-gray-100"
							/>
							<span className="text-lg">{item.name}</span>
						</div>

						<div className="space-y-4">
							<div className="flex justify-between py-2">
								<span className="text-gray-600">Quantity</span>
								<span>{item.quantity} bags</span>
							</div>
							<Separator />

							<div className="flex justify-between py-2">
								<span className="text-gray-600">Product price</span>
								<span>{item.price * item.quantity} USD</span>
							</div>
							<Separator />
						</div>
					</div>
				))}

				<div className="space-y-4 mt-6">
					<div className="flex justify-between py-2">
						<span className="text-gray-600">Delivery address</span>
						<div className="text-right">
							<span className="block font-medium">My home</span>
							<span className="block text-sm text-gray-500">
								{deliveryAddress.street}, {deliveryAddress.apartment}
							</span>
							<span className="block text-sm text-gray-500">
								{deliveryAddress.city} {deliveryAddress.zipCode}
							</span>
						</div>
					</div>
					<Separator />

					<div className="flex justify-between py-2">
						<span className="text-gray-600">Delivery price</span>
						<span>+{deliveryPrice} USD</span>
					</div>
					<Separator />

					<div className="flex justify-between items-center py-2">
						<span className="text-gray-600">Total price</span>
						<div className="flex items-center gap-2">
							<span>{totalPrice} USD</span>
							<ArrowDownIcon className="h-4 w-4 text-yellow-500" />
						</div>
					</div>
				</div>

				<Button // Updated button component
					onClick={onNext}
					className="w-full bg-yellow-400 hover:bg-yellow-500 text-black mt-6 h-14"
				>
					Proceed to payment
				</Button>
			</div>
		</div>
	);
}
