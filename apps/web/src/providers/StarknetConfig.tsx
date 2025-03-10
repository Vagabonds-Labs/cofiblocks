"use client";

import { InjectedConnector } from "@starknet-react/core";
import { createContext, useContext } from "react";

interface StarknetConfigContextType {
	availableConnectors: InjectedConnector[];
}

const StarknetConfigContext = createContext<StarknetConfigContextType>({
	availableConnectors: [],
});

export function useStarknetConfig() {
	return useContext(StarknetConfigContext);
}

export function StarknetConfigProvider({
	children,
}: { children: React.ReactNode }) {
	const connectors = [
		new InjectedConnector({ options: { id: "braavos" } }),
		new InjectedConnector({ options: { id: "argentX" } }),
	];

	return (
		<StarknetConfigContext.Provider value={{ availableConnectors: connectors }}>
			{children}
		</StarknetConfigContext.Provider>
	);
}
