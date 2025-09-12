"use client";

import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Button from "@repo/ui/button";
import { Text } from "@repo/ui/typography";
import { type Connector, useAccount, useConnect } from "@starknet-react/core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { connect } from "starknetkit";
import { ARGENT_WEBWALLET_URL } from "~/constants";

export default function WalletConnectFlow() {
	const [isClient, setIsClient] = useState(false);
	const [isConnecting, setIsConnecting] = useState(false);
	const [connectionError, setConnectionError] = useState<string | null>(null);
	const { isConnecting: isAutoConnecting } = useAccount();
	const { connect: connectWallet, connectors } = useConnect();
	const { t } = useTranslation();
	const router = useRouter();

	const handleConnectWallet = async (connector: Connector): Promise<void> => {
		if (connector) {
			try {
				setIsConnecting(true);
				setConnectionError(null);
				connectWallet({ connector });
				router.push("/marketplace");
			} catch (error) {
				console.error("Failed to connect wallet:", error);
				setConnectionError(t("error_connecting_wallet"));
			} finally {
				setIsConnecting(false);
			}
		}
	};

	const handleConnectArgentMobile = async (): Promise<void> => {
		try {
			setIsConnecting(true);
			setConnectionError(null);
			const result = await connect({
				webWalletUrl: ARGENT_WEBWALLET_URL,
				argentMobileOptions: {
					dappName: "CofiBlocks",
					url: "https://web.argent.xyz",
				},
			});

			if (result?.connector) {
				connectWallet({
					connector: result.connector as unknown as Connector,
				});
				router.push("/marketplace");
			}
		} catch (error) {
			console.error("Error connecting Argent Mobile:", error);
			setConnectionError(t("error_connecting_argent"));
		} finally {
			setIsConnecting(false);
		}
	};

	useEffect(() => {
		setIsClient(true);
	}, []);

	return (
		<div className="p-6 space-y-6">
			{isAutoConnecting && (
				<div className="text-center mb-4">
					<Text className="text-content-body-default">
						{t("connecting_to_wallet")}
					</Text>
				</div>
			)}
			{connectionError && (
				<div className="text-center text-red-500 mb-4">
					<Text>{connectionError}</Text>
				</div>
			)}
			<div className="flex flex-col justify-center items-center space-y-4">
				{isClient && (
					<>
						{Array.isArray(connectors) &&
							connectors.map((connector) => (
								<Button
									key={connector.id}
									onClick={() => void handleConnectWallet(connector)}
									className="w-full max-w-[15rem]"
									disabled={!connector.available() || isConnecting}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center">
											<span>{t(`${connector.id}`)}</span>
										</div>
										<ChevronRightIcon className="h-5 w-5" />
									</div>
								</Button>
							))}
					</>
				)}
			</div>
		</div>
	);
}
