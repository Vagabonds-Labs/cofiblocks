"use client";

import { ChevronRightIcon, UserIcon } from "@heroicons/react/24/outline";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ProfileCard } from "~/app/_components/features/ProfileCard";
import { ProfileOptions } from "~/app/_components/features/ProfileOptions";
import Header from "~/app/_components/layout/Header";
import Main from "~/app/_components/layout/Main";
import WalletDetails from "~/app/_components/features/WalletDetails";
import type { UnsafeMetadata } from "~/types";
import Button from "@repo/ui/button";
import SkeletonLoader from "@repo/ui/skeleton";

type Badge = "lover" | "contributor" | "producer";

export default function UserProfile() {
	const { t } = useTranslation();
	const router = useRouter();
	const { isLoaded: clerkLoaded, isSignedIn, user } = useUser();
	
	// Get wallet info from Clerk metadata
	const walletMetadata = (user?.unsafeMetadata as UnsafeMetadata | undefined)?.wallet;
	const hasWallet = !!walletMetadata?.encryptedPrivateKey;

	useEffect(() => {
		if (clerkLoaded && isSignedIn && !hasWallet) {
			router.push("/onboarding");
		}
	}, [clerkLoaded, isSignedIn, hasWallet, router]);

	// Show loading state while checking data
	if (!clerkLoaded) {
		return (
			<Main>
				<Header />
				<div className="container mx-auto px-4 py-8">
					<div className="max-w-3xl mx-auto space-y-6">
						<div className="bg-white shadow rounded-lg overflow-hidden">
							<div className="p-6 w-full flex items-center justify-center">
								<div className="w-full max-w-2xl">
									<SkeletonLoader width="w-full" height="h-64" />
								</div>
							</div>
						</div>
						<div className="bg-white shadow rounded-lg overflow-hidden">
							<div className="p-6 w-full flex items-center justify-center">
								<div className="w-full max-w-2xl">
									<SkeletonLoader width="w-full" height="h-48" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</Main>
		);
	}

	if (!isSignedIn) {
		return (
			<Main>
				<Header />
				<div className="container mx-auto px-4 py-8">
					<div className="text-center">
						<p className="mb-4">{t("sign_in_required")}</p>
						<Link href="/sign-in">
							<Button variant="primary">{t("sign_in")}</Button>
						</Link>
					</div>
				</div>
			</Main>
		);
	}

	const userProfile = {
		name: user.fullName ?? t("unnamed_user"),
		country: t("costa_rica"),
		memberSince: user.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear(),
		walletAddress: walletMetadata?.address ?? "0x0000000000000000000000000000000000000000",
		role: "user",
		badges: ["lover", "contributor"] as Badge[],
	};

	return (
		<Main>
			<div className="container mx-auto px-4 py-8">
				<Header profileOptions={<ProfileOptions />} />
				<div className="max-w-3xl mx-auto space-y-6">
					<ProfileCard user={userProfile} />
					
					{hasWallet && (
						<div className="bg-white shadow rounded-lg overflow-hidden">
							<div className="p-6">
								<h3 className="text-lg font-medium text-gray-900 mb-4">
									{t("wallet_details")}
								</h3>
								<WalletDetails />
							</div>
						</div>
					)}

					<div className="bg-white shadow rounded-lg overflow-hidden">
						<div className="p-6">
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
					</div>
				</div>
			</div>
		</Main>
	);
}
