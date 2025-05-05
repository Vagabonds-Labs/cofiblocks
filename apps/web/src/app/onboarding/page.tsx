"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ec, stark, hash, CallData, constants, num, shortString } from "starknet";
import { completeOnboarding } from "./_actions";
import toast from "react-hot-toast";

const ARGENT_X_CLASS_HASH = "0x025ec026985a3bf9d0cc1fe17326b245dfdc3ff89b8fde106242a3ea56c5a918";

export default function OnboardingPage() {
	const [pin, setPin] = useState("");
	const [loading, setLoading] = useState(false);
	const { user } = useUser();
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user || !pin || pin.length < 6) {
			toast.error("Please enter a valid PIN (min 6 digits).");
			return;
		}

		setLoading(true);
		try {
			// 1. Generate Starknet Key Pair
			const privateKey = stark.randomAddress(); 
			const publicKeyBytes = ec.starkCurve.getPublicKey(privateKey, false) as Uint8Array; // Explicit type
			const publicKeyBN = num.toBigInt(publicKeyBytes); // Convert bytes to BigInt
			const publicKeyHex = num.toHex(publicKeyBN); // Hex for storage

			// 2. Derive Account Address 
			const constructorCallData = CallData.compile({
				owner: publicKeyBN, // Use BigInt
				guardian: 0, 
			});
			const accountAddress = hash.calculateContractAddressFromHash(
				publicKeyBN, // Use BigInt as salt
				ARGENT_X_CLASS_HASH,
				constructorCallData,
				constants.ZERO 
			);

			// 3. Encrypt Private Key (PLACEHOLDER)
			const encryptedPrivateKey = `encrypted:${pin}:${privateKey}`;

			// 4. Prepare wallet data
			const walletData = {
				account: accountAddress,
				publicKey: publicKeyHex, // Store hex
				encryptedPrivateKey: encryptedPrivateKey, 
			};

			// 5. Call server action
			await completeOnboarding(user.id, walletData);
			
			toast.success("Wallet created and saved successfully!");
			router.push("/marketplace");
		} catch (error) {
			console.error("Error during wallet creation/onboarding:", error);
			toast.error(error instanceof Error ? error.message : "Failed to create wallet.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow-md">
			<h1 className="text-2xl font-bold mb-6">Set Up Your Secure Wallet</h1>
			<p className="mb-4 text-gray-600">
				Create a secure PIN (minimum 6 digits) to encrypt your new Starknet wallet.
				You'll need this PIN for transactions.
			</p>

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
					{loading ? "Creating Wallet..." : "Create Secure Wallet"}
				</button>
			</form>
		</div>
	);
}
