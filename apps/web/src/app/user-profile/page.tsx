"use client";

import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useState } from "react";
import { ProfileCard } from "~/app/_components/features/ProfileCard";
import Header from "~/app/_components/layout/Header";
import Main from "~/app/_components/layout/Main";

type Badge = "Founder" | "Lover" | "Contributor" | "Producer";

type UserProfile = {
	name: string;
	country: string;
	memberSince: number;
	thumbnailUrl: string;
	badges: Badge[];
};

export default function UserProfile() {
	const { address } = useAccount();
	const { connect, connectors } = useConnect();
	const { disconnect } = useDisconnect();

	const [user] = useState<UserProfile>({
		name: "John Doe",
		country: "United States",
		memberSince: 2020,
		thumbnailUrl: "/images/user-profile/avatar.svg",
		badges: ["Founder", "Lover"],
	});

	return (
		<Main>
			<Header
				address={address}
				connect={connect}
				connectors={connectors}
				disconnect={disconnect}
			/>
			<div className="container mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold mb-6">User Profile</h1>
				<ProfileCard user={user} />
			</div>
		</Main>
	);
}
