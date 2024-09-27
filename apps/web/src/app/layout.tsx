"use client";

import "~/styles/globals.css";
import { useAccount } from "@starknet-react/core";
import { GeistSans } from "geist/font/sans";
import { SessionProvider } from "next-auth/react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import StarknetProvider from "~/providers/starknet";
import { TRPCReactProvider } from "~/trpc/react";

function AuthWrapper({ children }: { children: React.ReactNode }) {
	const { address } = useAccount();
	const { data: session } = useSession();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (!address && !session && pathname !== "/") {
			router.push("/");
		} else if (address && session && pathname === "/") {
			router.push("/marketplace");
		}
	}, [address, session, router, pathname]);

	return <>{children}</>;
}

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
						<TRPCReactProvider>
							<AuthWrapper>{children}</AuthWrapper>
						</TRPCReactProvider>
					</StarknetProvider>
				</SessionProvider>
			</body>
		</html>
	);
}
