"use client";

import PageHeader from "@repo/ui/pageHeader";
import { useAccount, useDisconnect } from "@starknet-react/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProfileCard } from "~/app/_components/features/ProfileCard";
import { ProfileOptions } from "~/app/_components/features/ProfileOptions";
import Main from "~/app/_components/layout/Main";
import type { UserProfileType } from "~/types";

export default function UserProfile() {
	const { address } = useAccount();
	const { disconnect } = useDisconnect();

	const [user] = useState<UserProfileType>({
		name: "John Doe",
		country: "United States",
		memberSince: 2020,
		thumbnailUrl: "/images/user-profile/avatar.svg",
		badges: ["Lover"],
	});

	const router = useRouter();

	return (
		<Main>
			<div className="container mx-auto px-4 py-8">
				<PageHeader
					title="User Profile"
					userAddress={address}
					onLogout={disconnect}
					showBackButton
					onBackClick={() => router.back()}
					showBlockie={false}
				/>
				<ProfileCard user={user} />
				<ProfileOptions />
			</div>
		</Main>
	);
}
