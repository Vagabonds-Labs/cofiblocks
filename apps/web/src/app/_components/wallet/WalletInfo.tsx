"use client";

import { useUser } from "@clerk/nextjs";

export default function WalletInfo() {
	const { user, isLoaded } = useUser();
	const wallet = user?.publicMetadata
		?.wallet as Clerk.UserPublicMetadata["wallet"];

	if (!isLoaded) {
		return <div>Loading...</div>;
	}

	if (!wallet) {
		return (
			<div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
				<p className="text-yellow-700">
					Wallet not set up. Please complete onboarding.
				</p>
			</div>
		);
	}

	return (
		<div className="p-4 bg-green-50 border border-green-200 rounded-md">
			<h3 className="text-lg font-semibold mb-2">Wallet Info</h3>
			<div className="grid gap-2">
				<div>
					<span className="font-medium">Account: </span>
					<code className="bg-gray-100 p-1 rounded text-sm">
						{wallet.account}
					</code>
				</div>
				<div>
					<span className="font-medium">Public Key: </span>
					<code className="bg-gray-100 p-1 rounded text-sm">
						{wallet.publicKey}
					</code>
				</div>
			</div>
		</div>
	);
}
