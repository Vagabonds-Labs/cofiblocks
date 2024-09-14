"use client";

import "~/styles/globals.css";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { GeistSans } from "geist/font/sans";
import { TRPCReactProvider } from "~/trpc/react";
import StarknetProvider from "~/utils/starknet/provider";
import { useAccount } from "@starknet-react/core";

function AuthWrapper({ children }: { children: React.ReactNode }) {
	const { address } = useAccount();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (!address && pathname !== "/") {
			router.push("/");
		} else if (address && pathname === "/") {
			router.push("/catalog");
		}
	}, [address, router, pathname]);

	return <>{children}</>;
}

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" data-theme="cofiblocks" className={`${GeistSans.variable}`}>
			<body>
				<StarknetProvider>
					<TRPCReactProvider>
						<AuthWrapper>
							{children}
						</AuthWrapper>
					</TRPCReactProvider>
				</StarknetProvider>
			</body>
		</html>
	);
}
