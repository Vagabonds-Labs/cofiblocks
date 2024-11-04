import { sepolia } from "@starknet-react/chains";
import { StarknetConfig, publicProvider } from "@starknet-react/core";
import type { Connector } from "@starknet-react/core";
import { InjectedConnector } from "starknetkit/injected";

export default function StarknetProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const connectors = [
		// TODO: add ArgentX
		new InjectedConnector({
			options: { id: "argentX" },
		}),
		new InjectedConnector({
			options: { id: "braavos" },
		}),
	];

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
