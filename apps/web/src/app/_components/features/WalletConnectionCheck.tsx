"use client";

import { useAccount } from "@starknet-react/core";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCavosAuth } from "~/providers/cavos-auth";
import WalletConnectFlow from "./WalletConnectFlow";

interface WalletConnectionCheckProps {
	children: React.ReactNode;
}

export default function WalletConnectionCheck({
	children,
}: WalletConnectionCheckProps) {
	const { isAuthenticated, user, isLoading } = useCavosAuth();
	const { address } = useAccount();
	const [showConnectPrompt, setShowConnectPrompt] = useState(false);
	const { t } = useTranslation();

	useEffect(() => {
		// Since Cavos provides the wallets, we don't need to show the connect prompt
		// The wallet should be available after authentication
		setShowConnectPrompt(false);

		// Log wallet information for debugging
		if (isAuthenticated && user) {
			console.log("User wallet information:", {
				isAuthenticated,
				userWallet: user.walletAddress,
				starknetAddress: address,
			});
		}
	}, [user, address, isAuthenticated]);

	// Don't show prompt during loading/transitioning states
	if (isLoading) {
		return children;
	}

	if (showConnectPrompt) {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
				<div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
					<h2 className="text-xl font-bold text-center mb-4">
						{t("connect_wallet")}
					</h2>
					<WalletConnectFlow />
				</div>
			</div>
		);
	}

	return children;
}
