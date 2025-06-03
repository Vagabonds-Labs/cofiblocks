"use client";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import "~/styles/globals.css";
import "~/i18n";
import { ClerkProvider } from "@clerk/nextjs";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { GeistSans } from "geist/font/sans";
import { SessionProvider } from "next-auth/react";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import i18n from "~/i18n";
import { Providers as ChipiProvider } from "~/providers/chipi/ChipiProvider";
import StarknetProvider from "~/providers/starknet";
import { TRPCReactProvider } from "~/trpc/react";
import BetaAnnouncement from "./_components/ui/BetaAnnouncement";
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	useEffect(() => {
		const savedLanguage = localStorage.getItem("app_language");
		if (savedLanguage) {
			void i18n.changeLanguage(savedLanguage);
		} else {
			// Set Spanish as default if no saved preference
			void i18n.changeLanguage("es");
			localStorage.setItem("app_language", "es");
		}
	}, []);

	return (
		<ClerkProvider
			publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
			appearance={{
				baseTheme: undefined,
				elements: {
					formButtonPrimary: "bg-yellow-500 hover:bg-yellow-600 text-white",
					footerActionLink: "text-yellow-500 hover:text-yellow-600",
					formFieldInput: "border-yellow-500 focus:border-yellow-600",
					formFieldLabel: "text-yellow-500",
					card: "bg-white shadow-lg",
					headerTitle: "text-yellow-500",
					headerSubtitle: "text-gray-600",
					dividerLine: "bg-yellow-500",
					dividerText: "text-yellow-500",
					socialButtonsBlockButton:
						"border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white",
					socialButtonsBlockButtonArrow: "text-yellow-500",
					identityPreviewEditButton: "text-yellow-500",
					formFieldAction: "text-yellow-500",
					formFieldInputShowPasswordButton: "text-yellow-500",
					alertText: "text-yellow-500",
					alertIcon: "text-yellow-500",
					alert: "bg-yellow-500/10 border-yellow-500",
				},
			}}
		>
			<html
				suppressHydrationWarning
				lang="es"
				data-theme="cofiblocks"
				className={`${GeistSans.variable} ${inter.className}`}
			>
				<body>
					<SessionProvider>
						<StarknetProvider>
							<TRPCReactProvider>
								<ChipiProvider>
									<BetaAnnouncement />
									<div className="pb-20">{children}</div>
								</ChipiProvider>
							</TRPCReactProvider>
						</StarknetProvider>
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
					</SessionProvider>
					<NextTopLoader />
				</body>
			</html>
		</ClerkProvider>
	);
}
