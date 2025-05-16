"use server";

import { clerkClient } from "@clerk/nextjs/server";

// Restore original completeOnboarding function
export async function completeOnboarding(
	userId: string,
	wallet: {
		account: string;
		publicKey: string;
		encryptedPrivateKey: string;
	},
) {
	try {
		console.log(`Completing onboarding for user ${userId} with wallet data...`);
		// Update metadata with the full (or relevant parts of) the mock wallet object
		const client = await clerkClient();
		await client.users.updateUserMetadata(userId, {
			publicMetadata: {
				// Store the mock wallet data
				// Adjust structure as needed (e.g., nested 'wallet' object)
				wallet: {
					account: wallet.account,
					publicKey: wallet.publicKey,
					encryptedPrivateKey: wallet.encryptedPrivateKey,
				}
			},
		});
		console.log(`Successfully updated metadata for user ${userId}`);
		// Return success or necessary data
		return { success: true }; 
	} catch (error) {
		console.error("Error completing onboarding (updating metadata):", error);
		throw new Error("Failed to update user profile with wallet data.");
	}
}

// Removed updateWalletMetadata function
