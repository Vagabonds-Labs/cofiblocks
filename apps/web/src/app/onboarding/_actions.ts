"use server";

import { clerkClient } from "@clerk/nextjs/server";

interface WalletData {
	encryptedPrivateKey: string;
	publicKey: string;
	address: string;
	txHash: string;
}

export async function completeOnboarding(userId: string, wallet: WalletData) {
	try {
		console.log(
			`[completeOnboarding] Starting onboarding completion for user ${userId}`,
		);
		console.log("[completeOnboarding] Wallet data:", {
			...wallet,
			encryptedPrivateKey: wallet.encryptedPrivateKey ? "***" : undefined,
		});

		// Update metadata with the wallet data
		const client = await clerkClient();
		console.log("[completeOnboarding] Updating user metadata...");

		const updatedUser = await client.users.updateUserMetadata(userId, {
			unsafeMetadata: {
				wallet: {
					encryptedPrivateKey: wallet.encryptedPrivateKey,
					publicKey: wallet.publicKey,
					address: wallet.address,
					txHash: wallet.txHash,
				},
				walletCreated: true,
			},
		});

		console.log("[completeOnboarding] Metadata update response:", {
			id: updatedUser.id,
			hasWallet: !!updatedUser.unsafeMetadata?.wallet,
			walletCreated: updatedUser.unsafeMetadata?.walletCreated,
		});

		return { success: true };
	} catch (error) {
		console.error("[completeOnboarding] Error completing onboarding:", error);
		throw new Error("Failed to update user profile with wallet data.");
	}
}

// Removed updateWalletMetadata function
