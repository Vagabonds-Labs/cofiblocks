"use client";

import { useAccount, useDisconnect } from "@starknet-react/core";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ProfileCard } from "~/app/_components/features/ProfileCard";
import { ProfileOptions } from "~/app/_components/features/ProfileOptions";
import WalletConnectFlow from "~/app/_components/features/WalletConnectFlow";
import Header from "~/app/_components/layout/Header";
import Main from "~/app/_components/layout/Main";
import { api } from "~/trpc/react";

type Badge = "lover" | "contributor" | "producer";

export default function UserProfile() {
	const { t } = useTranslation();
	const { address } = useAccount();
	const { disconnect } = useDisconnect();
	const router = useRouter();
	const { data: session, status } = useSession();
	const userId = session?.user?.id;

	const { data: user, isLoading } = api.user.getUser.useQuery(
		{ userId: userId ?? "" },
		{
			enabled: !!userId,
			retry: false,
		},
	);

	// Debug user data
	useEffect(() => {
		if (user) {
			console.log("User Data:", {
				walletAddress: user.walletAddress,
				isPlaceholder: user.walletAddress?.startsWith("placeholder_"),
				hasStarknetWallet: !!address,
			});
		}
	}, [user, address]);

	// Show loading state while checking data
	if (isLoading) {
		return (
			<Main>
				<div className="container mx-auto px-4 py-8">
					<Header address={address} disconnect={disconnect} />
					<div className="animate-pulse">
						<div className="h-48 bg-gray-200 rounded-lg mb-6" />
					</div>
				</div>
			</Main>
		);
	}

	// Check if user needs to connect wallet
	const needsWalletConnection = !address;

	// Show wallet connection flow if needed
	if (needsWalletConnection) {
		return (
			<Main>
				<div className="min-h-screen flex items-center justify-center">
					<div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
						<h1 className="text-2xl font-bold text-center mb-6">
							{t("connect_wallet")}
						</h1>
						<p className="text-gray-600 text-center mb-8">
							{t("connect_wallet_description")}
						</p>
						<WalletConnectFlow />
					</div>
				</div>
			</Main>
		);
	}

	// Only show profile if we have user data
	if (!user) {
		return (
			<Main>
				<div className="container mx-auto px-4 py-8 text-center">
					<Header address={address} disconnect={disconnect} />
					<p className="text-red-500">{t("error_loading_profile")}</p>
				</div>
			</Main>
		);
	}

	const userProfile = {
		name: user.name ?? t("unnamed_user"),
		country: "costa_rica",
		memberSince: new Date(user.createdAt).getFullYear(),
		walletAddress: user.walletAddress,
		role: user.role,
		badges: ["lover", "contributor"] as Badge[],
	};

	return (
		<Main>
			<div className="container mx-auto px-4 py-8">
				<Header
					address={address}
					disconnect={disconnect}
					profileOptions={<ProfileOptions address={address} />}
				/>
				<ProfileCard user={userProfile} />
				<ProfileOptions address={address} />
			</div>
		</Main>
	);
}
