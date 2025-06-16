"use client";

import { ChipiProvider } from "@chipi-pay/chipi-sdk";

// Use NEXT_PUBLIC_CHIPI_PUBLIC_KEY from .env file
//const chipiPublicKey = process.env.NEXT_PUBLIC_CHIPI_PUBLIC_KEY;

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ChipiProvider
			config={{
				//apiPublicKey: chipiPublicKey,
				apiPublicKey: "pk_prod_c399b92e830cb2354327838d9a06d296",
			}}
		>
			{children}
		</ChipiProvider>
	);
}
