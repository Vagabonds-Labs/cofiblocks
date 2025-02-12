import { mainnet, sepolia } from "@starknet-react/chains";
import {
	StarknetConfig,
	publicProvider,
	useInjectedConnectors,
} from "@starknet-react/core";
import type { Connector } from "@starknet-react/core";
import { argent, braavos } from "@starknet-react/core";

export default function StarknetProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const { connectors } = useInjectedConnectors({
		// Show these connectors if the user has no connector installed.
		recommended: [argent(), braavos()],
		includeRecommended: "onlyIfNoConnectors",
		// Randomize the order of the connectors.
		order: "random",
	});

	return (
		<StarknetConfig
			autoConnect
			chains={[mainnet, sepolia]}
			provider={publicProvider()}
			connectors={connectors}
		>
			{children}
		</StarknetConfig>
	);
}
