import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export interface CartItem {
	id: string;
	name: string;
	quantity: number;
	price: number;
	imageUrl: string;
}

export const cartItemsAtom = atomWithStorage<CartItem[]>(
	"shopping-cart-storage",
	[],
);

export const addItemAtom = atom(null, (get, set, newItem: CartItem) => {
	const items = get(cartItemsAtom);
	const existingItem = items.find((item) => item.id === newItem.id);

	if (existingItem) {
		set(
			cartItemsAtom,
			items.map((item) =>
				item.id === newItem.id
					? { ...item, quantity: item.quantity + 1 }
					: item,
			),
		);
	} else {
		set(cartItemsAtom, [...items, newItem]);
	}
});

export const removeItemAtom = atom(null, (get, set, id: string) => {
	const items = get(cartItemsAtom);
	set(
		cartItemsAtom,
		items.filter((item) => item.id !== id),
	);
});

export const clearCartAtom = atom(null, (_, set) => {
	set(cartItemsAtom, []);
});
