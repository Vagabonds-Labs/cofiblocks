"use client";

import { useSession } from "next-auth/react";
import WalletConnectFlow from "./WalletConnectFlow";

interface CustomUser {
	email: string | null;
	name?: string | null;
	image?: string | null;
	walletAddress?: string;
	role: string;
}

export default function UserProfile() {
	const { data: session } = useSession();
	const user = session?.user as CustomUser | undefined;

	if (!user) return null;

	const isPlaceholderWallet =
		typeof user.walletAddress === "string" &&
		user.walletAddress.startsWith("placeholder_");

	return (
		<div className="space-y-6 p-4">
			<div className="rounded-lg bg-white p-6 shadow-lg">
				<h2 className="text-2xl font-bold">Profile</h2>
				<div className="mt-4">
					<p>Email: {user.email}</p>
					<p>Role: {user.role}</p>
				</div>

				{/* Show wallet connect flow if no wallet is connected */}
				{!isPlaceholderWallet && (
					<div className="mt-6">
						<WalletConnectFlow />
					</div>
				)}
			</div>
		</div>
	);
}
