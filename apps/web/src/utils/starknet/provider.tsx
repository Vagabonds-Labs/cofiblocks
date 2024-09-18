import { goerli } from "@starknet-react/chains";
import { StarknetConfig, publicProvider } from "@starknet-react/core";
import type { Connector } from "@starknet-react/core";
import { WebWalletConnector } from "starknetkit/webwallet";

export default function StarknetProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const chains = [goerli];
	const provider = publicProvider();
	const connectors = [
		new WebWalletConnector({ url: "https://web.argent.xyz" }),
	];

	return (
		<StarknetConfig
			autoConnect
			chains={chains}
			provider={provider}
			connectors={connectors as unknown as Connector[]}
		>
			{children}
		</StarknetConfig>
	);
}
