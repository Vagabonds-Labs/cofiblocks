"use client";

import { useTranslation } from "react-i18next";
import Modal from "@repo/ui/modal";

type BridgeWidgetModalProps = {
	isOpen: boolean;
	onClose: () => void;
	recipientAddress: string;
};

function BridgeWidgetModal({ isOpen, onClose, recipientAddress }: BridgeWidgetModalProps) {
	const { t } = useTranslation();
	const apiKey = process.env.NEXT_PUBLIC_RHINO_API_KEY ?? "";

	// Supported chains for the widget (URL-encoded JSON)
	const includeChains = encodeURIComponent(
		JSON.stringify({
			ARBITRUM: true,
			AVALANCHE: true,
			BASE: true,
			BINANCE: true,
			CELO: true,
			ETHEREUM: true,
			GNOSIS: true,
			LINEA: true,
			MANTLE: true,
			MATIC_POS: true,
			OPTIMISM: true,
			SCROLL: true,
			STARKNET: true,
			ZKSYNC: true,
		}),
	);

	// Build widget URL with updated parameters
	const widgetUrl = apiKey
		? `https://widget.rhino.fi/?apiKey=${apiKey}&include=${includeChains}&chainIn=ETHEREUM&chainOut=STARKNET&recipient=${encodeURIComponent(recipientAddress)}`
		: `https://widget.rhino.fi/?include=${includeChains}&chainIn=ETHEREUM&chainOut=STARKNET&recipient=${encodeURIComponent(recipientAddress)}`;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={t("wallet.bridge_from_other_blockchains") || "Bridge from Other Blockchains"}
		>
			<div className="w-full">
				{apiKey ? (
					<div className="w-full overflow-hidden rounded-lg">
						<iframe
							src={widgetUrl}
							className="w-full border-0"
							style={{ minHeight: "581px", height: "581px" }}
							scrolling="no"
							title={t("wallet.bridge_from_other_blockchains") || "Rhino Bridge Widget"}
							allow="clipboard-write"
						/>
					</div>
				) : (
					<div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
						<p className="text-sm text-yellow-800">
							{t("wallet.widget_config_error") ||
								"Bridge widget is not configured. Please set NEXT_PUBLIC_RHINO_API_KEY in your environment variables."}
						</p>
					</div>
				)}
			</div>
		</Modal>
	);
}

export { BridgeWidgetModal };

