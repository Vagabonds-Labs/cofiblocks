"use client";

import { useAccount } from "@starknet-react/core";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import WalletConnectFlow from "./WalletConnectFlow";

interface WalletConnectionCheckProps {
	children: React.ReactNode;
}

export default function WalletConnectionCheck({
	children,
}: WalletConnectionCheckProps) {
	const { data: session, status } = useSession();
	const { address } = useAccount();
	const [showConnectPrompt, setShowConnectPrompt] = useState(false);
	const { t } = useTranslation();

	useEffect(() => {
		// Only show the connect prompt if there's a session but no wallet
		// and we're not in a loading state
		if (status === "authenticated" && session && !address) {
			setShowConnectPrompt(true);
		} else {
			setShowConnectPrompt(false);
		}
	}, [session, address, status]);

	// Don't show prompt during loading/transitioning states
	if (status === "loading") {
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
