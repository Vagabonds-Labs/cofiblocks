import { atom } from "jotai";
import type { Product } from "~/app/_components/features/types";

export const searchQueryAtom = atom<string>("");
export const searchResultsAtom = atom<Product[]>([]);
export const isLoadingAtom = atom<boolean>(false);
export const quantityOfProducts = atom<number>(0);

export const searchProductCatalogAtom = atom(
	(get) => get(searchQueryAtom),
	async (get, set, newQuery: string) => {
		set(searchQueryAtom, newQuery);
		set(isLoadingAtom, true);
		set(quantityOfProducts, 0);
	},
);
