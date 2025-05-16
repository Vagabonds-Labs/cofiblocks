"use server";

import { clerkClient } from "@clerk/nextjs/server";
import type { WalletData } from "~/types";

// Restore original completeOnboarding function
export async function completeOnboarding(
	userId: string,
	wallet: WalletData,
) {
	try {
		console.log(`Completing onboarding for user ${userId} with wallet data...`);
		// Update metadata with the wallet data
		const client = await clerkClient();
		await client.users.updateUserMetadata(userId, {
			unsafeMetadata: {
				wallet: {
					encryptedPrivateKey: wallet.encryptedPrivateKey,
					publicKey: wallet.publicKey,
					address: wallet.address,
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
