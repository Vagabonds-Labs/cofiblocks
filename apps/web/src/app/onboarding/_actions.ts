"use server";

import { clerkClient } from "@clerk/nextjs/server";

interface WalletData {
	encryptedPrivateKey: string;
	publicKey: string;
	address: string;
	txHash: string;
}

export async function completeOnboarding(
	userId: string,
	wallet: WalletData,
) {
	try {
		console.log(`Completing onboarding for user ${userId} with wallet data:`, wallet);
		
		// Update metadata with the wallet data
		const client = await clerkClient();
		await client.users.updateUserMetadata(userId, {
			unsafeMetadata: {
				wallet: {
					encryptedPrivateKey: wallet.encryptedPrivateKey,
					publicKey: wallet.publicKey,
					address: wallet.address,
					txHash: wallet.txHash,
				},
				walletCreated: true
			},
		});
		
		console.log(`Successfully updated metadata for user ${userId}`);
		return { success: true }; 
	} catch (error) {
		console.error("Error completing onboarding:", error);
		throw new Error("Failed to update user profile with wallet data.");
	}
}

// Removed updateWalletMetadata function
