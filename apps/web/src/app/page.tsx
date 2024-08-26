"use client";

import { useAccount } from "@starknet-react/core";
import { useConnect } from "@starknet-react/core";
import { useDisconnect } from "@starknet-react/core";
import ProductCatalog from "~/app/_components/features/ProductCatalog";
import Header from "~/app/_components/layout/Header";
import Main from "~/app/_components/layout/Main";
import Hero from "~/app/_components/ui/Hero";
import { api } from "~/trpc/react";

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
			<Hero
				title="Welcome Coffee Lover"
				description="Find the best coffee in the world"
				buttonText="Search"
				buttonOnClick={() => console.log("Button clicked")}
			/>
			<ProductCatalog />
		</Main>
	);
}
