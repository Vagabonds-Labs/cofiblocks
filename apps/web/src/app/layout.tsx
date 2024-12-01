"use client";

import { useEffect } from "react";
import "~/styles/globals.css";
import "~/i18n";
import { GeistSans } from "geist/font/sans";
import { SessionProvider } from "next-auth/react";
import i18n from "~/i18n";
import StarknetProvider from "~/providers/starknet";
import { TRPCReactProvider } from "~/trpc/react";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	useEffect(() => {
		const savedLanguage = localStorage.getItem("app_language");
		if (savedLanguage) {
			void i18n.changeLanguage(savedLanguage);
		}
	}, []);

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
