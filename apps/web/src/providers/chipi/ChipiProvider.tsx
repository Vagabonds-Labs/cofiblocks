"use client";

import { ChipiProvider as ChipiSDKProvider } from "@chipi-pay/chipi-sdk";
import type { ReactNode } from "react";

interface ChipiProviderProps {
	children: ReactNode;
}

export function ChipiProvider({ children }: ChipiProviderProps) {
	const apiKey = process.env.NEXT_PUBLIC_CHIPI_PUBLIC_KEY;
	const appId = process.env.NEXT_PUBLIC_CHIPI_APP_ID;
	const secretKey = process.env.NEXT_PUBLIC_CHIPI_SECRET_KEY;

	if (!apiKey || !appId || !secretKey) {
		throw new Error("Chipi configuration is not set");
	}

	return (
		<ChipiSDKProvider
			config={{
				apiKey,
				appId,
				secretKey
			}}
		>
			{children}
		</ChipiSDKProvider>
	);
} 