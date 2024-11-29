"use client";

import PageHeader from "@repo/ui/pageHeader";
import { useAccount, useDisconnect } from "@starknet-react/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ProfileCard } from "~/app/_components/features/ProfileCard";
import { ProfileOptions } from "~/app/_components/features/ProfileOptions";
import Main from "~/app/_components/layout/Main";

type Badge = "lover" | "contributor" | "producer"; // Keep these lowercase for consistency

type UserProfile = {
	name: string;
	country: string;
	memberSince: number;
	thumbnailUrl: string;
	badges: Badge[];
};

export default function UserProfile() {
	const { t } = useTranslation();
	const { address } = useAccount();
	const { disconnect } = useDisconnect();

	const [user] = useState<UserProfile>({
		name: "John Doe",
		country: "united_states",
		memberSince: 2020,
		thumbnailUrl: "/images/user-profile/avatar.svg",
		badges: ["lover", "contributor"], // Use lowercase keys here
	});

	const router = useRouter();

	return (
		<Main>
			<div className="container mx-auto px-4 py-8">
				<PageHeader
					title={t("user_profile")}
					userAddress={address}
					onLogout={disconnect}
					showBackButton
					onBackClick={() => router.back()}
					showBlockie={false}
				/>
				<ProfileCard
					user={{
						...user,
						country: t(user.country),
					}}
				/>
				<ProfileOptions />
			</div>
		</Main>
	);
}
