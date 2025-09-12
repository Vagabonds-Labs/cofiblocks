"use client";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import "~/styles/globals.css";
import "~/i18n";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { GeistSans } from "geist/font/sans";
import { SessionProvider } from "next-auth/react";
import i18n from "~/i18n";
import StarknetProvider from "~/providers/starknet";
import { TRPCReactProvider } from "~/trpc/react";
import WalletConnectionCheck from "./_components/features/WalletConnectionCheck";
import BetaAnnouncement from "./_components/ui/BetaAnnouncement";

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
						<TRPCReactProvider>
							<WalletConnectionCheck>
								<BetaAnnouncement />
								<div className="pb-20">{children}</div>
							</WalletConnectionCheck>
						</TRPCReactProvider>
					</StarknetProvider>
				</SessionProvider>
				<Toaster
					position="top-center"
					toastOptions={{
						duration: 3000,
						style: {
							backgroundColor: "#E9F1EF",
							color: "#3B3E3F",
						},
						success: {
							icon: <CheckCircleIcon className="w-6 h-6 text-[#067c6d]" />,
						},
						error: {
							style: {
								backgroundColor: "#E9F1EF",
								color: "#3B3E3F",
							},
							icon: <CheckCircleIcon className="w-6 h-6 text-[red]" />,
						},
					}}
				/>
			</body>
		</html>
	);
}
