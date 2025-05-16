"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";

export function useWalletDetails() {
	const { user, isLoaded } = useUser();
	const wallet = user?.publicMetadata
		?.wallet as Clerk.UserPublicMetadata["wallet"];

	return {
		isLoaded,
		account: wallet?.account ?? "",
		publicKey: wallet?.publicKey ?? "",
		isWalletCreated: !!wallet,
		userType: user?.publicMetadata?.userType as
			| "COFFEE_PRODUCER"
			| "BUYER"
			| "ADMIN"
			| undefined,
	};
}

// This is a placeholder for future implementation with an actual wallet SDK
export function useTransferToken() {
	const [pin, setPin] = useState("");
	const [recipient, setRecipient] = useState("");
	const [amount, setAmount] = useState("");
	const { user } = useUser();

	const handleTransfer = async () => {
		if (!user?.publicMetadata?.wallet) return;

		try {
			// This is a placeholder - implement actual transfer logic
			console.log("Transfer", { pin, recipient, amount });
			return {
				success: true,
				txHash: `0x${Math.random().toString(16).slice(2)}`,
			};
		} catch (error) {
			console.error("Transfer error:", error);
			throw error;
		}
	};

	return {
		pin,
		setPin,
		recipient,
		setRecipient,
		amount,
		setAmount,
		handleTransfer,
	};
}
