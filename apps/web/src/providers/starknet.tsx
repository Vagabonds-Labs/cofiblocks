import { sepolia } from "@starknet-react/chains";
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
		// Hide recommended connectors if the user has any connector installed.
		includeRecommended: "onlyIfNoConnectors",
		// Randomize the order of the connectors.
		order: "random",
	});

	return (
		<StarknetConfig
			autoConnect
			// TODO: change to mainnet
			chains={[sepolia]}
			provider={publicProvider()}
			connectors={connectors as unknown as Connector[]}
		>
			{children}
		</StarknetConfig>
	);
}
