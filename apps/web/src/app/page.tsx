"use client";

import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import Carousel from "@repo/ui/carousel";
import { api } from "~/trpc/react";
import ProductCatalog from "~/app/_components/features/ProductCatalog";
import Header from "~/app/_components/layout/Header";
import Main from "~/app/_components/layout/Main";

const carouselData = [
	{ id: "1", tag: "New", title: "Welcome Coffee Lover", image: "/images/carousel1.webp" },
	{ id: "2", tag: "Featured", title: "Find the best coffee in the world", image: "/images/carousel2.webp" },
	{ id: "3", tag: "Popular", title: "Discover unique blends", image: "/images/carousel3.webp" }
];

export default function Home() {
	const { address } = useAccount();
	const { connect, connectors } = useConnect();
	const { disconnect } = useDisconnect();
	const { data: cartItems } = api.shoppingCart.getItems.useQuery({ cartId: 1 });

	return (
		<Main>
			<Header
				address={address}
				connect={connect}
				connectors={connectors}
				disconnect={disconnect}
				cartItems={0}
			/>
			<Carousel cards={carouselData} />
			<ProductCatalog />
		</Main>
	);
}
