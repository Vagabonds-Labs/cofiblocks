"use client";

import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import Header from "~/app/_components/layout/Header";
import Main from "~/app/_components/layout/Main";

export default function UserProfile() {
	const { address } = useAccount();
	const { connect, connectors } = useConnect();
	const { disconnect } = useDisconnect();

	return (
		<Main>
			<Header
				address={address}
				connect={connect}
				connectors={connectors}
				disconnect={disconnect}
			/>
			<div className="container mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold mb-6">User Profile</h1>
			</div>
		</Main>
	);
}
