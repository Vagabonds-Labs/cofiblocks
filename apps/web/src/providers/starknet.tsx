"use client";

import { mainnet, sepolia } from "@starknet-react/chains";
import {
	StarknetConfig,
	argent,
	braavos,
	publicProvider,
} from "@starknet-react/core";

export default function StarknetProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const connectors = [argent(), braavos()];

	return (
		<StarknetConfig
			chains={[mainnet, sepolia]}
			provider={publicProvider()}
			connectors={connectors}
		>
			{children}
		</StarknetConfig>
	);
}
