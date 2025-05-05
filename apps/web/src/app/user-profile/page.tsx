"use client";

import { useUser } from "@clerk/nextjs";
import { useMockWallet } from "~/providers/mock-wallet/MockWalletContext";
import Header from "~/app/_components/layout/Header";
import Main from "~/app/_components/layout/Main";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { UserIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Button from "@repo/ui/button";

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
				<h1 className="text-3xl font-bold mb-6">User Profile</h1>

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

				{hasWallet && wallet && (
					<div className="mb-8 p-4 bg-gray-50 rounded-lg">
						<h2 className="text-xl font-semibold mb-4">Wallet Information</h2>
						<p className="mb-2">
							<span className="font-medium">Account: </span>
							<code className="bg-gray-100 p-1 rounded text-sm break-all">
								{wallet.account}
							</code>
						</p>
						<p className="mb-2">
							<span className="font-medium">Public Key: </span>
							<code className="bg-gray-100 p-1 rounded text-sm break-all">
								{wallet.publicKey}
							</code>
						</p>
					</div>
				)}

				{isSignedIn && !hasWallet && (
					<div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
						<h2 className="text-xl font-semibold mb-4">{t("no_wallet_found")}</h2>
						<p className="mb-4">{t("setup_wallet_prompt")}</p>
						<Link href="/onboarding">
							<Button variant="primary">{t("go_to_setup")}</Button>
						</Link>
					</div>
				)}

				{isSignedIn && (
					<div className="mb-6">
						<Link
							href="/user/edit-profile/my-profile"
							className="w-full bg-white text-content-title flex items-center justify-between p-4 rounded-lg hover:bg-surface-secondary-soft transition-colors"
						>
							<div className="flex items-center">
								<UserIcon className="w-5 h-5 mr-3" />
								<span>{t("edit_my_profile")}</span>
							</div>
							<ChevronRightIcon className="w-5 h-5 text-content-body-default" />
						</Link>
					</div>
				)}
			</div>
		</Main>
	);
}
