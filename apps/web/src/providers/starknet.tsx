import { mainnet, sepolia } from "@starknet-react/chains";
import {
	StarknetConfig,
	publicProvider,
	useInjectedConnectors,
} from "@starknet-react/core";
import { argent, braavos } from "@starknet-react/core";

export default function StarknetProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const { connectors } = useInjectedConnectors({
		recommended: [argent(), braavos()],
		includeRecommended: "onlyIfNoConnectors",
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
