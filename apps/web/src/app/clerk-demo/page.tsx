"use client";

import { useUser } from "@clerk/nextjs";
import { useMockWallet } from "~/providers/mock-wallet/MockWalletContext";

export default function ClerkDemoPage() {
	const { isLoaded, isSignedIn, user } = useUser();
	const { wallet, loading: walletLoading, hasWallet } = useMockWallet();

	if (!isLoaded || walletLoading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				Loading...
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8 px-4">
			<h1 className="text-3xl font-bold mb-6">Clerk Authentication Demo</h1>

			<div className="mb-8 p-4 bg-gray-50 rounded-lg">
				<h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
				<p className="mb-2">
					<span className="font-medium">Signed In: </span>
					<span className={isSignedIn ? "text-green-600" : "text-red-600"}>
						{isSignedIn ? "Yes" : "No"}
					</span>
				</p>
				{isSignedIn && (
					<p className="mb-2">
						<span className="font-medium">User Email: </span>
						<span>{user?.primaryEmailAddress?.emailAddress ?? "No email"}</span>
					</p>
				)}
			</div>

			<div className="mb-8 p-4 bg-gray-50 rounded-lg">
				<h2 className="text-xl font-semibold mb-4">Authentication Links</h2>
				<div className="flex gap-4">
					{!isSignedIn ? (
						<>
							<a
								href="/sign-in"
								className="px-4 py-2 bg-blue-500 text-white rounded"
							>
								Sign In
							</a>
							<a
								href="/sign-up"
								className="px-4 py-2 bg-green-500 text-white rounded"
							>
								Sign Up
							</a>
						</>
					) : (
						<a
							href="/sign-out"
							className="px-4 py-2 bg-red-500 text-white rounded"
						>
							Sign Out
						</a>
					)}
				</div>
			</div>

			{hasWallet && (
				<div className="mb-8 p-4 bg-gray-50 rounded-lg">
					<h2 className="text-xl font-semibold mb-4">Wallet Information</h2>
					<p className="mb-2">
						<span className="font-medium">Account: </span>
						<code className="bg-gray-100 p-1 rounded text-sm">
							{wallet?.account}
						</code>
					</p>
					<p className="mb-2">
						<span className="font-medium">Public Key: </span>
						<code className="bg-gray-100 p-1 rounded text-sm">
							{wallet?.publicKey}
						</code>
					</p>
					<div className="mt-4">
						<a
							href="/onboarding"
							className="px-4 py-2 bg-green-500 text-white rounded"
						>
							Re-create Wallet
						</a>
					</div>
				</div>
			)}

			{isSignedIn && !hasWallet && (
				<div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
					<h2 className="text-xl font-semibold mb-4">No Wallet Found</h2>
					<p className="mb-4">You don&apos;t have a wallet set up yet.</p>
					<a
						href="/onboarding"
						className="px-4 py-2 bg-green-500 text-white rounded"
					>
						Create Wallet
					</a>
				</div>
			)}
		</div>
	);
}
