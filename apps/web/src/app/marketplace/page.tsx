"use client";

import Carousel from "@repo/ui/carousel";
import { useAccount, useDisconnect } from "@starknet-react/core";
import { useAtom } from "jotai";
import ProductCatalog from "~/app/_components/features/ProductCatalog";
import Header from "~/app/_components/layout/Header";
import Main from "~/app/_components/layout/Main";
import { searchQueryAtom } from "~/atoms/productAtom";
import SearchBar from "../_components/features/SearchBar";

const carouselData = [
	{
		id: "1",
		tag: "New",
		title: "Welcome Coffee Lover",
		image: "/images/carousel1.webp",
	},
	{
		id: "2",
		tag: "Featured",
		title: "Find the best coffee in the world",
		image: "/images/carousel2.webp",
	},
	{
		id: "3",
		tag: "Popular",
		title: "Discover unique blends",
		image: "/images/carousel3.webp",
	},
];

export default function Home() {
	const { address } = useAccount();
	const { disconnect } = useDisconnect();
	const [query] = useAtom(searchQueryAtom);

	return (
		<Main>
			<Header address={address} disconnect={disconnect} />
			<SearchBar />

			{query.length <= 0 && (
				<>
					<Carousel cards={carouselData} />
				</>
			)}
			<ProductCatalog />
		</Main>
	);
}
