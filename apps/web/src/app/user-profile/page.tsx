"use client";

import { useUser } from "@clerk/nextjs";
import Header from "~/app/_components/layout/Header";
import Main from "~/app/_components/layout/Main";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { UserIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Button from "@repo/ui/button";
import type { UnsafeMetadata } from "~/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import WalletDetails from "~/app/_components/features/WalletDetails";

export default function UserProfile() {
	const { t } = useTranslation();
	const { isLoaded: clerkLoaded, isSignedIn, user } = useUser();
	const router = useRouter();
	
	// Get wallet info from Clerk metadata
	const walletMetadata = (user?.unsafeMetadata as UnsafeMetadata | undefined)?.wallet;
	const hasWallet = !!walletMetadata?.encryptedPrivateKey;

	useEffect(() => {
		if (clerkLoaded && isSignedIn && !hasWallet) {
			router.push("/onboarding");
		}
	}, [clerkLoaded, isSignedIn, hasWallet, router]);

	if (!clerkLoaded) {
		return (
			<Main>
				<Header />
				<div className="container mx-auto px-4 py-8 text-center">
					<p>Loading...</p>
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

	return (
		<Main>
			<Header />
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-3xl mx-auto">
					<div className="bg-white shadow rounded-lg overflow-hidden">
						<div className="p-6">
							<div className="flex items-center">
								<UserIcon className="h-12 w-12 text-gray-400" />
								<div className="ml-4">
									<h2 className="text-2xl font-bold text-gray-900">
										{user.fullName || t("profile")}
									</h2>
									<p className="text-gray-500">{user.primaryEmailAddress?.emailAddress}</p>
								</div>
							</div>

							{hasWallet ? (
								<WalletDetails />
							) : (
								<div className="mt-6">
									<p className="text-gray-500 mb-4">{t("no_wallet_message")}</p>
									<Link href="/onboarding">
										<Button variant="primary">{t("create_wallet")}</Button>
									</Link>
								</div>
							)}

							<div className="mt-6 border-t border-gray-200 pt-6">
								<div className="divide-y divide-gray-200">
									<Link
										href="/marketplace"
										className="flex items-center justify-between py-3 hover:bg-gray-50 px-3 -mx-3 rounded-lg transition-colors"
									>
										<span className="text-gray-700">{t("marketplace")}</span>
										<ChevronRightIcon className="h-5 w-5 text-gray-400" />
									</Link>
									{/* Add more profile sections/links here */}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Main>
	);
}
