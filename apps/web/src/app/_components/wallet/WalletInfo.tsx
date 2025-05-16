"use client";

import { useUser } from "@clerk/nextjs";
import type { UnsafeMetadata } from "~/types";

export default function WalletInfo() {
	const { user, isLoaded } = useUser();
	const metadata = user?.unsafeMetadata as UnsafeMetadata | undefined;
	
	// Check both possible locations for wallet data
	const encryptedPrivateKey = metadata?.encryptedPrivateKey || metadata?.wallet?.encryptedPrivateKey;
	const publicKey = metadata?.wallet?.publicKey;
	const address = metadata?.wallet?.address;

	if (!isLoaded) {
		return <div>Loading...</div>;
	}

	if (!encryptedPrivateKey) {
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
				{address && (
					<div>
						<span className="font-medium">Address: </span>
						<code className="bg-gray-100 p-1 rounded text-sm">
							{address}
						</code>
					</div>
				)}
				{publicKey && (
					<div>
						<span className="font-medium">Public Key: </span>
						<code className="bg-gray-100 p-1 rounded text-sm">
							{publicKey}
						</code>
					</div>
				)}
			</div>
		</div>
	);
}
