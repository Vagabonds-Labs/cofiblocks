"use client";

import { XMarkIcon } from "@heroicons/react/24/solid";
import { api } from "~/trpc/react";

interface ShoppingCartProps {
	closeCart: () => void;
}

interface CartItem {
	id: number;
	product: {
		name: string;
		price: number;
	};
	quantity: number;
}

export default function ShoppingCart({ closeCart }: ShoppingCartProps) {
	const cartId = 1; // Assume you have the logic to get the cartId

	const utils = api.useUtils();

	const { mutate: removeItem } = api.shoppingCart.removeItem.useMutation({
		onSuccess: async () => {
			await utils.shoppingCart.getItems.invalidate();
		},
	});

	const handleRemoveItem = (itemId: number) => {
		removeItem({ itemId });
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
						{cartItems?.map((item: CartItem) => (
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
							{cartItems?.reduce(
								(total: number, item: CartItem) =>
									total + item.product.price * item.quantity,
								0,
							)}
						</p>
					</div>
					<button
						className="mt-4 w-full rounded-xl bg-primary p-4 text-white"
						type="button"
					>
						Checkout
					</button>
				</>
			)}
		</div>
	);
}
