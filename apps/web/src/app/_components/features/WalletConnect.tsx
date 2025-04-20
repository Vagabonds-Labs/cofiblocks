"use client";

import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Button from "@repo/ui/button";
import { H1, Text } from "@repo/ui/typography";
import {
	type Connector,
	useAccount,
	useConnect,
	useDisconnect,
} from "@starknet-react/core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import BottomModal from "../ui/BottomModal";

interface WalletConnectProps {
	isOpen?: boolean;
	onClose?: () => void;
	isModal?: boolean;
}

export default function WalletConnect({
	isOpen = false,
	onClose = () => {
		/* no-op */
	},
	isModal = true,
}: WalletConnectProps) {
	const [isClient, setIsClient] = useState(false);
	const [isConnecting, setIsConnecting] = useState(false);
	const [connectionError, setConnectionError] = useState<string | null>(null);
	const { address, isConnecting: isAutoConnecting } = useAccount();
	const { connect: connectWallet, connectors } = useConnect();
	const { disconnect } = useDisconnect();
	const { t } = useTranslation();
	const router = useRouter();

	// Reset error when modal opens
	useEffect(() => {
		if (isOpen) {
			setConnectionError(null);
		}
	}, [isOpen]);

	const handleConnectWallet = async (connector: Connector): Promise<void> => {
		if (connector) {
			try {
				setIsConnecting(true);
				setConnectionError(null);
				const result = connectWallet({ connector });
				console.log("connector result", result);
				router.push("/marketplace");
			} catch (error) {
				console.error("Error connecting wallet:", error);
				setConnectionError(t("error_connecting_wallet"));
			} finally {
				setIsConnecting(false);
			}
		}
	};

	const handleDisconnectWallet = (): void => {
		try {
			disconnect();
			router.push("/");
			toast.success(t("successfully_disconnected"));
		} catch (error) {
			console.error("Error disconnecting:", error);
			toast.error(t("error_disconnecting"));
		}
	};

	useEffect(() => {
		setIsClient(true);
	}, []);

	const content = (
		<div className="p-6 md:p-8 space-y-6">
			<div className="text-center">
				<Text className="text-content-title text-lg mt-2">
					{t("welcome_to")}
				</Text>
				<H1 className="text-content-title">CofiBlocks</H1>
			</div>
			{isAutoConnecting && (
				<div className="text-center">
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
				{address ? (
					<button
						onClick={handleDisconnectWallet}
						className="block text-center text-content-title text-base font-normal font-inter underline transition-colors duration-300 hover:text-content-title-hover"
						type="button"
					>
						{t("disconnect")}
					</button>
				) : (
					<>
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
					</>
				)}
			</div>
		</div>
	);

	if (!isModal) {
		return content;
	}

	return (
		<BottomModal isOpen={isOpen} onClose={onClose}>
			{content}
		</BottomModal>
	);
}
