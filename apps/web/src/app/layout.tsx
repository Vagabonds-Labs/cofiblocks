"use client";

import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import SiteHead from "~/app/_components/layout/SiteHead";
import { TRPCReactProvider } from "~/trpc/react";

import StarknetProvider from "~/utils/starknet/provider";

// export const metadata: Metadata = {
//   title: "CofiBlocks",
//   description: "CofiBlocks is a platform for buying and selling coffee beans",
//   icons: [{ rel: "icon", url: "/favicon.ico" }],
// };

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${GeistSans.variable}`}>
			<body>
				<StarknetProvider>
					<TRPCReactProvider>
						{/* <SiteHead /> */}
						{children}
					</TRPCReactProvider>
				</StarknetProvider>
			</body>
		</html>
	);
}
