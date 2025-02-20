import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Button from "@repo/ui/button";
import { H1, Text } from "@repo/ui/typography";
import {
	type Connector,
	useAccount,
	useConnect,
	useDisconnect,
	useSignTypedData,
} from "@starknet-react/core";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { connect } from "starknetkit";
import { ARGENT_WEBWALLET_URL, MESSAGE } from "~/constants";
import { api } from "~/trpc/react";
import BottomModal from "../ui/BottomModal";

interface WalletConnectProps {
	isOpen?: boolean;
	onClose?: () => void;
	onSuccess?: () => void;
	isModal?: boolean;
}

export default function WalletConnect({
	isOpen = false,
	onClose = () => {
		/* no-op */
	},
	onSuccess,
	isModal = true,
}: WalletConnectProps) {
	const [isClient, setIsClient] = useState(false);
	const [isConnecting, setIsConnecting] = useState(false);
	const [connectionError, setConnectionError] = useState<string | null>(null);
	const { address, isConnecting: isAutoConnecting } = useAccount();
	const { connect: connectWallet, connectors } = useConnect();
	const { disconnect } = useDisconnect();
	const { signTypedDataAsync } = useSignTypedData(MESSAGE);
	const { t } = useTranslation();
	const router = useRouter();
	const utils = api.useUtils();

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

	const handleSignMessage = async (): Promise<void> => {
		try {
			setIsConnecting(true);
			setConnectionError(null);
			const signature = await signTypedDataAsync();

			const signInResult = await signIn("credentials", {
				address,
				message: JSON.stringify(MESSAGE),
				redirect: false,
				signature,
			});

			if (signInResult?.ok) {
				await utils.user.getMe.prefetch();
				toast.success(t("successfully_signed_in"));
				onSuccess?.();
			} else {
				setConnectionError(t("error_signing_in"));
				toast.error(t("error_signing_in"));
			}
		} catch (err) {
			console.error(t("error_signing_message"), err);
			setConnectionError(t("error_signing_message"));
			toast.error(t("error_signing_message"));
		} finally {
			setIsConnecting(false);
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
