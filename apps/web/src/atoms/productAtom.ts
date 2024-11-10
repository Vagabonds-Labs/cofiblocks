import { atom } from "jotai";

interface Product {
	id: number;
	name: string;
	price: number;
	region: string;
	farmName: string;
	strength: string;
	nftMetadata: string;
	process?: string;
	createdAt: Date;
	updatedAt: Date;
}

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
