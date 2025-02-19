"use client";

import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Button from "@repo/ui/button";
import { Text } from "@repo/ui/typography";
import {
	type Connector,
	useAccount,
	useConnect,
	useDisconnect,
} from "@starknet-react/core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { connect } from "starknetkit";
import { ARGENT_WEBWALLET_URL } from "~/constants";

export default function WalletConnectFlow() {
	const [isClient, setIsClient] = useState(false);
	const [isConnecting, setIsConnecting] = useState(false);
	const { address } = useAccount();
	const { connect: connectWallet, connectors } = useConnect();
	const { disconnect } = useDisconnect();
	const { t } = useTranslation();
	const router = useRouter();

	const handleConnectWallet = async (connector: Connector): Promise<void> => {
		if (connector) {
			try {
				connectWallet({ connector });
				console.log("Connecting with connector:", connector.id);
				// The address effect will handle the redirect
			} catch (error) {
				console.error("Error connecting wallet:", error);
			}
		}
	};

	const handleConnectArgentMobile = async (): Promise<void> => {
		try {
			setIsConnecting(true);
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
				console.log("Connecting with Argent Mobile");
				// The address effect will handle the redirect
			}
		} catch (error) {
			console.error("Error connecting Argent Mobile:", error);
		} finally {
			setIsConnecting(false);
		}
	};

	const handleDisconnectWallet = (): void => {
		disconnect();
		router.push("/");
	};

	// Redirect to marketplace when address is available
	useEffect(() => {
		if (address) {
			router.push("/marketplace");
		}
	}, [address, router]);

	useEffect(() => {
		setIsClient(true);
	}, []);

	return (
		<div className="p-6 space-y-6">
			<div className="text-center">
				<Text className="text-content-title text-lg">
					{t("connect_your_wallet")}
				</Text>
			</div>
			<div className="flex flex-col justify-center items-center space-y-4">
				{address ? (
					<Button
						onClick={handleDisconnectWallet}
						variant="secondary"
						size="lg"
						className="w-full max-w-[15rem]"
					>
						{t("disconnect")}
					</Button>
				) : (
					<>
						{isClient && (
							<>
								<Button
									onClick={() => void handleConnectArgentMobile()}
									className="w-full max-w-[15rem]"
									disabled={isConnecting}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center">
											<span>
												{isConnecting ? t("connecting") : t("argent_mobile")}
											</span>
										</div>
										<ChevronRightIcon className="h-5 w-5" />
									</div>
								</Button>
								{Array.isArray(connectors) &&
									connectors.map((connector) => (
										<Button
											key={connector.id}
											onClick={() => void handleConnectWallet(connector)}
											className="w-full max-w-[15rem]"
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
					</>
				)}
			</div>
		</div>
	);
}
