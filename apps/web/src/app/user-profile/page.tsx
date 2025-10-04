"use client";

import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { ProfileCard } from "~/app/_components/features/ProfileCard";
import { ProfileOptions } from "~/app/_components/features/ProfileOptions";
import { UserBalances } from "~/app/_components/features/UserBalances";
import Header from "~/app/_components/layout/Header";
import Main from "~/app/_components/layout/Main";
import { api } from "~/trpc/react";

type Badge = "lover" | "contributor" | "producer";

export default function UserProfile() {
	const { t } = useTranslation();
	const { data: session, status: sessionStatus } = useSession();
	const user = session?.user;

	// Only fire when we have a userId
	const { data: userData, isLoading: isLoadingUser } =
		api.user.getUser.useQuery(
			{ userId: user?.id ?? "" },
			{ enabled: !!user?.id, retry: false },
		);

	const {
		data: balances,
		isLoading: isLoadingBalances,
		error: balancesError,
		refetch: refetchBalances,
	} = api.user.getUserBalances.useQuery(
		{ userId: user?.id ?? "" },
		{ enabled: !!user?.id, retry: false },
	);

	// Handle global loading states (session → user → balances)
	if (sessionStatus === "loading" || (user?.id && isLoadingUser)) {
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

	const userProfile = {
		name: userData?.name ?? user?.email ?? t("unnamed_user"),
		country: t("costa_rica"),
		memberSince: userData?.createdAt
			? new Date(userData.createdAt).getFullYear()
			: new Date().getFullYear(),
		walletAddress: userData?.walletAddress ?? "",
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

				{/* Balances loading skeleton */}
				{isLoadingBalances && (
					<div className="bg-white rounded-lg shadow-md p-6 mb-6">
						<div className="animate-pulse">
							<div className="h-6 bg-gray-200 rounded mb-4 w-1/3" />
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								{[
									{ id: "skeleton-1" },
									{ id: "skeleton-2" },
									{ id: "skeleton-3" },
									{ id: "skeleton-4" },
								].map((item) => (
									<div
										key={item.id}
										className="flex flex-col items-center p-4 bg-gray-50 rounded-lg"
									>
										<div className="w-12 h-12 bg-gray-200 rounded-full mb-3" />
										<div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
										<div className="h-6 bg-gray-200 rounded w-1/2" />
									</div>
								))}
							</div>
						</div>
					</div>
				)}

				{/* Balances error */}
				{balancesError && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
						<p className="text-red-600">
							Error loading balances:{" "}
							{balancesError?.message ?? "Unknown error"}
						</p>
						<button
							type="button"
							onClick={() => refetchBalances()}
							className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
						>
							Retry
						</button>
					</div>
				)}

				{/* Balances data */}
				{!isLoadingBalances && !balancesError && (
					<UserBalances
						balances={{
							starkBalance: balances?.starkBalance ?? 0,
							usdtBalance: balances?.usdtBalance ?? 0,
							usdcBalance: balances?.usdcBalance ?? 0,
							claimBalance: balances?.claimBalance ?? 0,
						}}
					/>
				)}
			</div>
		</Main>
	);
}
