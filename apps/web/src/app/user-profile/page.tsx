"use client";

// import { ChevronRightIcon, UserIcon } from "@heroicons/react/24/outline";
// import Link from "next/link";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ProfileCard } from "~/app/_components/features/ProfileCard";
import { ProfileOptions } from "~/app/_components/features/ProfileOptions";
import Header from "~/app/_components/layout/Header";
import Main from "~/app/_components/layout/Main";
import { useCavosAuth } from "~/providers/cavos-auth";
import { api } from "~/trpc/react";

type Badge = "lover" | "contributor" | "producer";

export default function UserProfile() {
	const { t } = useTranslation();
	const { user: cavosUser, isAuthenticated } = useCavosAuth();
	const userId = cavosUser?.id;

	// Get user data from API if we have a userId
	const { data: userData, isLoading } = api.user.getUser.useQuery(
		{ userId: userId ?? "" },
		{
			enabled: !!userId,
			retry: false,
		},
	);

	// Debug user data
	useEffect(() => {
		if (userData) {
			console.log("User Data:", {
				walletAddress: userData.walletAddress,
				isPlaceholder: userData.walletAddress?.startsWith("placeholder_"),
				cavosUser: cavosUser,
			});
		}
	}, [userData, cavosUser]);

	// Show loading state while checking data
	if (isLoading) {
		return (
			<Main>
				<div className="container mx-auto px-4 py-8">
					<Header />
					<div className="animate-pulse">
						<div className="h-48 bg-gray-200 rounded-lg mb-6" />
					</div>
				</div>
			</Main>
		);
	}

	// Only show profile if we have user data
	if (!isAuthenticated || !cavosUser) {
		return (
			<Main>
				<div className="container mx-auto px-4 py-8 text-center">
					<Header />
					<p className="text-red-500">{t("error_loading_profile")}</p>
				</div>
			</Main>
		);
	}

	// Create user profile from Cavos user data and API data
	const userProfile = {
		name: userData?.name ?? cavosUser.email ?? t("unnamed_user"),
		country: t("costa_rica"),
		memberSince: userData?.createdAt
			? new Date(userData.createdAt).getFullYear()
			: new Date().getFullYear(),
		walletAddress: cavosUser.walletAddress ?? "",
		role: userData?.role ?? "USER",
		badges: ["lover", "contributor"] as Badge[],
	};

	return (
		<Main>
			<div className="container mx-auto px-4 py-8">
				<Header
					profileOptions={
						<ProfileOptions address={userProfile.walletAddress} />
					}
				/>
				<ProfileCard user={userProfile} />
				{/* Edit profile link removed as requested, but component kept for later use */}
			</div>
		</Main>
	);
}
