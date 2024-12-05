import { useAtomValue } from "jotai";
import { cartItemsAtom } from "~/store/cartAtom";

export function useCartCalculations(deliveryPrice: number) {
	const cartItems = useAtomValue(cartItemsAtom);

	const productPrice = cartItems.reduce(
		(total, item) => total + item.price * item.quantity,
		0,
	);
	const totalPrice = productPrice + deliveryPrice;

	return { cartItems, productPrice, totalPrice };
}
