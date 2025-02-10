"use client";

import { XMarkIcon } from "@heroicons/react/24/solid";
import { useAtom, useAtomValue } from "jotai";
import { useRouter } from "next/navigation";
import { useTranslation } from "~/i18n";
import { cartItemsAtom, removeItemAtom } from "~/store/cartAtom";

interface ShoppingCartProps {
	closeCart: () => void;
}

export default function ShoppingCart({ closeCart }: ShoppingCartProps) {
	const { t } = useTranslation();
	const router = useRouter();
	const items = useAtomValue(cartItemsAtom);
	const [, removeItem] = useAtom(removeItemAtom);

	const handleRemoveItem = (itemId: string) => {
		removeItem(itemId);
	};

	const handleCheckout = () => {
		closeCart();
		router.push("/shopping-cart");
	};

	const totalPrice = items.reduce(
		(total, item) => total + item.price * item.quantity,
		0,
	);

	return (
		<div className="absolute right-0 top-14 w-96 bg-white p-4 shadow-xl">
			<div className="flex items-center justify-between">
				<h3 className="text-xl font-bold">{t("shopping_cart")}</h3>
				<button onClick={closeCart} type="button">
					<XMarkIcon className="w-6 text-primary" />
				</button>
			</div>
			<div className="mt-4 flex flex-col gap-4">
				{items.map((item) => (
					<div key={item.id} className="flex items-center justify-between">
						<p>{item.name}</p>
						<p>${item.price}</p>
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
