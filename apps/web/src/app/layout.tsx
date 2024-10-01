"use client";

import "~/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { SessionProvider } from "next-auth/react";
import StarknetProvider from "~/providers/starknet";
import { TRPCReactProvider } from "~/trpc/react";

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html
			suppressHydrationWarning
			lang="en"
			data-theme="cofiblocks"
			className={`${GeistSans.variable}`}
		>
			<body>
				<SessionProvider>
					<StarknetProvider>
						<TRPCReactProvider>{children}</TRPCReactProvider>
					</StarknetProvider>
				</SessionProvider>
			</body>
		</html>
	);
}
