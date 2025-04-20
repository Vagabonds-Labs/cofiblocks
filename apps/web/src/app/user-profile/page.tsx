"use client";

import { useUser } from "@clerk/nextjs";
import { useMockWallet } from "~/providers/mock-wallet/MockWalletContext";
import Header from "~/app/_components/layout/Header";
import Main from "~/app/_components/layout/Main";
import { useTranslation } from "react-i18next";

export default function UserProfile() {
	const { t } = useTranslation();
	const { isLoaded: clerkLoaded, isSignedIn, user } = useUser();
	const { wallet, loading: walletLoading, hasWallet } = useMockWallet();

	if (!clerkLoaded || walletLoading) {
		return (
			<Main>
				<Header />
				<div className="container mx-auto px-4 py-8 text-center">
					<p>Loading...</p>
				</div>
			</Main>
		);
	}

	return (
		<Main>
			<Header />
			<div className="container mx-auto py-8 px-4">
				<h1 className="text-3xl font-bold mb-6">User Profile (Clerk Style)</h1>

				<div className="mb-8 p-4 bg-gray-50 rounded-lg">
					<h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
					<p className="mb-2">
						<span className="font-medium">Signed In: </span>
						<span className={isSignedIn ? "text-green-600" : "text-red-600"}>
							{isSignedIn ? "Yes" : "No"}
						</span>
					</p>
					{isSignedIn && (
						<p className="mb-2">
							<span className="font-medium">User Email: </span>
							<span>{user?.primaryEmailAddress?.emailAddress ?? "No email"}</span>
						</p>
					)}
				</div>

				{hasWallet && (
					<div className="mb-8 p-4 bg-gray-50 rounded-lg">
						<h2 className="text-xl font-semibold mb-4">Wallet Information</h2>
						<p className="mb-2">
							<span className="font-medium">Account: </span>
							<code className="bg-gray-100 p-1 rounded text-sm">
								{wallet?.account}
							</code>
						</p>
						<p className="mb-2">
							<span className="font-medium">Public Key: </span>
							<code className="bg-gray-100 p-1 rounded text-sm">
								{wallet?.publicKey}
							</code>
						</p>
					</div>
				)}

				{isSignedIn && !hasWallet && (
					<div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
						<h2 className="text-xl font-semibold mb-4">{t("no_wallet_found")}</h2>
						<p className="mb-4">{t("setup_wallet_prompt")}</p>
						<a
							href="/onboarding"
							className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
						>
							{t("go_to_setup")}
						</a>
					</div>
				)}
			</div>
		</Main>
	);
}
