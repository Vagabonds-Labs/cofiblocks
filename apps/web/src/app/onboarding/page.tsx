"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMockWallet } from "~/providers/mock-wallet/MockWalletContext";
import { completeOnboarding } from "./_actions";

export default function OnboardingPage() {
	const [pin, setPin] = useState("");
	const [loading, setLoading] = useState(false);
	const { user } = useUser();
	const router = useRouter();
	const { createWallet, hasWallet } = useMockWallet();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user || !pin || pin.length < 6) return;

		setLoading(true);
		try {
			// Create a wallet using our mock wallet provider
			const wallet = await createWallet(pin);

			// Call the server action to log the wallet creation
			await completeOnboarding(user.id, wallet);

			// Redirect to marketplace
			router.push("/marketplace");
		} catch (error) {
			console.error("Error creating wallet:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow-md">
			<h1 className="text-2xl font-bold mb-6">Set Up Your CofiBlocks Wallet</h1>

			{hasWallet ? (
				<div className="bg-yellow-50 p-4 rounded-md mb-6">
					<p className="text-yellow-800 mb-2">
						You already have a wallet set up.
					</p>
					<p className="text-yellow-700">
						Creating a new one will replace your existing wallet.
					</p>
				</div>
			) : (
				<p className="mb-4 text-gray-600">
					Create a PIN to secure your wallet. This PIN will be used for your
					transactions.
				</p>
			)}

			<form onSubmit={handleSubmit}>
				<div className="mb-4">
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Security PIN (min 6 digits)
					</label>
					<input
						type="password"
						className="w-full px-4 py-2 border rounded-md"
						placeholder="Enter PIN"
						value={pin}
						onChange={(e) => setPin(e.target.value)}
						minLength={6}
						required
					/>
				</div>
				<button
					type="submit"
					className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
					disabled={loading}
				>
					{loading
						? "Creating..."
						: hasWallet
							? "Re-create Wallet"
							: "Create Wallet"}
				</button>
			</form>
		</div>
	);
}
