"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import type { UnsafeMetadata } from "~/types";

export function useWalletDetails() {
	const { user, isLoaded } = useUser();
	const metadata = user?.unsafeMetadata as UnsafeMetadata | undefined;
	const wallet = metadata?.wallet;
	
	return {
		isLoaded,
		address: wallet?.address ?? "",
		publicKey: wallet?.publicKey ?? "",
		encryptedPrivateKey: wallet?.encryptedPrivateKey ?? "",
		isWalletCreated: !!wallet?.encryptedPrivateKey,
		userType: user?.publicMetadata?.userType as
			| "COFFEE_PRODUCER"
			| "BUYER"
			| "ADMIN"
			| undefined,
	};
}

export function useTransferToken() {
	const [pin, setPin] = useState("");
	const [recipient, setRecipient] = useState("");
	const [amount, setAmount] = useState("");
	const { user } = useUser();

	const handleTransfer = async () => {
		if (!user?.unsafeMetadata?.wallet) return;

		try {
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
