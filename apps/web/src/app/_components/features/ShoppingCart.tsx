"use client";

import { XMarkIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

interface ShoppingCartProps {
	closeCart: () => void;
}

interface CartItem {
	id: string;
	product: {
		name: string;
		price: number;
	};
	quantity: number;
}

export default function ShoppingCart({ closeCart }: ShoppingCartProps) {
	const router = useRouter();
	const cartId = "1";
	const utils = api.useUtils();

	const { mutate: removeItem } = api.shoppingCart.removeItem.useMutation({
		onSuccess: async () => {
			await utils.shoppingCart.getItems.invalidate();
		},
	});

	const handleRemoveItem = (itemId: string) => {
		removeItem({ itemId });
	};

	const handleCheckout = () => {
		closeCart();
		router.push("/shopping-cart");
	};

	const { data: cartItems, isLoading } = api.shoppingCart.getItems.useQuery({
		cartId,
	});

	return (
		<div className="absolute right-0 top-14 w-96 bg-white p-4 shadow-xl">
			<div className="flex items-center justify-between">
				<h3 className="text-xl font-bold">Shopping Cart</h3>
				<button onClick={closeCart} type="button">
					<XMarkIcon className="w-6 text-primary" />
				</button>
			</div>
			{isLoading ? (
				<div>Loading...</div>
			) : (
				<>
					<div className="mt-4 flex flex-col gap-4">
						{cartItems?.items.map((item: CartItem) => (
							<div key={item.id} className="flex items-center justify-between">
								<p>{item.product.name}</p>
								<p>${item.product.price}</p>
								<button onClick={() => handleRemoveItem(item.id)} type="button">
									Remove
								</button>
							</div>
						))}
					</div>
					<div className="mt-4 flex justify-between">
						<p>Total</p>
						<p>
							$
							{cartItems?.items.reduce(
								(total: number, item: CartItem) =>
									total + item.product.price * item.quantity,
								0,
							)}
						</p>
					</div>
					<button
						className="mt-4 w-full rounded-lg bg-[#FFC222] py-3.5 px-4 text-base font-normal text-[#1F1F20]"
						type="button"
						onClick={handleCheckout}
					>
						Checkout
					</button>
				</>
			)}
		</div>
	);
}
