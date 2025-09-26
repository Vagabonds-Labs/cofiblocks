"use client";

import { useTranslation } from "react-i18next";
import { useCavosAuth } from "~/providers/cavos-auth";

type Badge = "lover" | "contributor" | "producer";

interface CustomUser {
	email: string | null;
	name?: string | null;
	image?: string | null;
	walletAddress?: string;
	role: string;
}

const BadgeComponent = ({ type, active }: { type: Badge; active: boolean }) => {
	const { t } = useTranslation();

	const badgeStyles = {
		base: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2",
		lover: "bg-pink-100 text-pink-800",
		contributor: "bg-blue-100 text-blue-800",
		producer: "bg-green-100 text-green-800",
		inactive: "bg-gray-100 text-gray-800 opacity-50",
	};

	return (
		<span
			className={`${badgeStyles.base} ${active ? badgeStyles[type] : badgeStyles.inactive}`}
		>
			{t(`badges.${type}`)}
		</span>
	);
};

export default function UserProfile() {
	const { user: cavosUser, isAuthenticated } = useCavosAuth();
	const { t } = useTranslation();

	// Create a custom user from Cavos user
	const user: CustomUser | undefined = cavosUser
		? {
				email: cavosUser.email,
				name: cavosUser.name || null,
				walletAddress: cavosUser.walletAddress || "",
				role: "USER", // Default role since CavosUser doesn't have a role property
			}
		: undefined;

	if (!isAuthenticated || !user) return null;

	// No need to check for placeholder wallet since Cavos provides real wallets

	// Determine which badges are active based on user role
	const badges: { type: Badge; active: boolean }[] = [
		{
			type: "lover",
			active: true, // Everyone gets this badge for being a coffee lover
		},
		{
			type: "contributor",
			active: user.role === "COFFEE_PRODUCER" || user.role === "ADMIN",
		},
		{
			type: "producer",
			active: user.role === "COFFEE_PRODUCER",
		},
	];

	return (
		<div className="space-y-6 p-4">
			<div className="rounded-lg bg-white p-6 shadow-lg">
				<h2 className="text-2xl font-bold">{t("profile")}</h2>
				<div className="mt-4">
					<p>Email: {user.email}</p>
					<p>Role: {user.role}</p>
					<div className="mt-3">
						<p className="text-sm text-gray-500 mb-2">{t("badges.title")}</p>
						<div className="flex flex-wrap gap-2">
							{badges.map((badge) => (
								<BadgeComponent
									key={badge.type}
									type={badge.type}
									active={badge.active}
								/>
							))}
						</div>
					</div>

					{/* Display wallet address if available */}
					{user.walletAddress && (
						<div className="mt-4">
							<p className="text-sm font-medium mb-1">Wallet:</p>
							<p className="text-xs break-all">{user.walletAddress}</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
