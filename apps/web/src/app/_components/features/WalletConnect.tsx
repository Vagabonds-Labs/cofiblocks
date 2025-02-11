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
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MESSAGE } from "~/constants";
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
	const { address } = useAccount();
	const { connect, connectors } = useConnect();
	const { disconnect } = useDisconnect();
	const { signTypedDataAsync } = useSignTypedData(MESSAGE);
	const { t } = useTranslation();
	const router = useRouter();

	const handleConnectWallet = async (connector: Connector): Promise<void> => {
		if (connector) {
			connect({ connector });
		}
	};

	const handleSignMessage = async (): Promise<void> => {
		try {
			const signature = await signTypedDataAsync();

			await signIn("credentials", {
				address,
				message: JSON.stringify(MESSAGE),
				redirect: false,
				signature,
			});
			onSuccess?.();
		} catch (err) {
			console.error(t("error_signing_message"), err);
		}
	};

	const handleDisconnectWallet = (): void => {
		disconnect();
		void signOut();
		router.push("/");
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
			<div className="flex flex-col justify-center items-center space-y-4">
				{address ? (
					<>
						<Button
							onClick={handleSignMessage}
							variant="primary"
							size="lg"
							className="w-full max-w-[15rem] px-4 py-3 text-content-title text-base font-medium font-inter rounded-lg border border-surface-secondary-default transition-all duration-300 hover:bg-surface-secondary-hover"
						>
							{t("sign")}
						</Button>
						<button
							onClick={handleDisconnectWallet}
							className="block text-center text-content-title text-base font-normal font-inter underline transition-colors duration-300 hover:text-content-title-hover"
							type="button"
						>
							{t("disconnect")}
						</button>
					</>
				) : (
					<>
						{isClient && (
							<>
								{connectors.map((connector) => (
									<Button
										key={connector.id}
										onClick={() => handleConnectWallet(connector)}
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

	if (!isModal) {
		return content;
	}

	return (
		<BottomModal isOpen={isOpen} onClose={onClose}>
			{content}
		</BottomModal>
	);
}
