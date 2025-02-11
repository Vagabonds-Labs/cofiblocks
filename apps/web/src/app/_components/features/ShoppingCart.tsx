"use client";

import { XMarkIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { api } from "~/trpc/react";

interface ShoppingCartProps {
	closeCart: () => void;
}

export default function ShoppingCart({ closeCart }: ShoppingCartProps) {
	const { t } = useTranslation();
	const router = useRouter();

	// Get cart data from server
	const { data: cart, refetch: refetchCart } = api.cart.getUserCart.useQuery();
	const { mutate: removeFromCart } = api.cart.removeFromCart.useMutation({
		onSuccess: () => {
			void refetchCart();
		},
	});

	const handleRemoveItem = (cartItemId: string) => {
		removeFromCart({ cartItemId });
	};

	const handleCheckout = () => {
		closeCart();
		router.push("/shopping-cart");
	};

	const totalPrice =
		cart?.items.reduce(
			(total, item) => total + item.product.price * item.quantity,
			0,
		) ?? 0;

	return (
		<div className="absolute right-0 top-14 w-96 bg-white p-4 shadow-xl">
			<div className="flex items-center justify-between">
				<h3 className="text-xl font-bold">{t("shopping_cart")}</h3>
				<button onClick={closeCart} type="button">
					<XMarkIcon className="w-6 text-primary" />
				</button>
			</div>
			<div className="mt-4 flex flex-col gap-4">
				{cart?.items.map((item) => (
					<div key={item.id} className="flex items-center justify-between">
						<p>{item.product.name}</p>
						<p>${item.product.price}</p>
						<button onClick={() => handleRemoveItem(item.id)} type="button">
							{t("remove")}
						</button>
					</div>
				))}
			</div>
			<div className="mt-4 flex justify-between">
				<p>Total</p>
				<p>${totalPrice}</p>
			</div>
			<button
				className="mt-4 w-full rounded-lg bg-primary py-3.5 px-4 text-base font-normal text-white"
				type="button"
				onClick={handleCheckout}
			>
				Checkout
			</button>
		</div>
	);
}
