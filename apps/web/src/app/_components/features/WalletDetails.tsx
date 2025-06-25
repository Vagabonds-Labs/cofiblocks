"use client";

import { useUser } from "@clerk/nextjs";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { UnsafeMetadata } from "~/types";

export default function WalletDetails() {
	const { t } = useTranslation();
	const { user } = useUser();
	const [showPrivateKey, setShowPrivateKey] = useState(false);

	const walletMetadata = (user?.unsafeMetadata as UnsafeMetadata | undefined)
		?.wallet;
	const hasWallet = !!walletMetadata?.encryptedPrivateKey;
	const walletCreated =
		(user?.unsafeMetadata as UnsafeMetadata | undefined)?.walletCreated ||
		false;

	const togglePrivateKeyVisibility = () => {
		setShowPrivateKey(!showPrivateKey);
	};

	if (!hasWallet || !walletCreated) {
		return null;
	}

	return (
		<div className="mt-6">
			<div className="bg-gray-50 p-4 rounded-md space-y-3">
				{/* Transaction Hash */}
				{walletMetadata.txHash && (
					<div className="flex flex-col">
						<span className="font-medium text-sm">
							{t("transaction_hash")}:
						</span>
						<div className="flex items-center gap-2">
							<code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono break-all">
								{walletMetadata.txHash}
							</code>
							<a
								href={`https://starkscan.co/tx/${walletMetadata.txHash}`}
								target="_blank"
								rel="noopener noreferrer"
								className="text-yellow-600 hover:text-yellow-800 text-sm"
							>
								{t("view_tx")}
							</a>
						</div>
					</div>
				)}

				{/* Wallet Address with Starkscan Link */}
				{walletMetadata.address && (
					<div className="flex flex-col">
						<span className="font-medium text-sm">{t("wallet_address")}:</span>
						<div className="flex items-center gap-2">
							<code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono break-all">
								{walletMetadata.address}
							</code>
							<a
								href={`https://starkscan.co/contract/${walletMetadata.address}`}
								target="_blank"
								rel="noopener noreferrer"
								className="text-yellow-600 hover:text-yellow-800 text-sm flex items-center gap-1"
							>
								{t("view_on_starkscan")}
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<title>External link</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
									/>
								</svg>
							</a>
						</div>
					</div>
				)}

				{/* Public Key */}
				{walletMetadata.publicKey && (
					<div className="flex flex-col">
						<span className="font-medium text-sm">{t("public_key")}:</span>
						<div className="flex items-center gap-2">
							<code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono break-all">
								{walletMetadata.publicKey}
							</code>
						</div>
					</div>
				)}

				{/* Encrypted Private Key with toggle */}
				{walletMetadata.encryptedPrivateKey && (
					<div className="flex flex-col">
						<span className="font-medium text-sm">
							{t("encrypted_private_key")}:
						</span>
						<div className="flex items-center gap-2">
							<code
								className={`flex-1 bg-gray-100 px-2 py-1 rounded text-sm font-mono break-all ${!showPrivateKey ? "filter blur-sm select-none" : ""}`}
							>
								{walletMetadata.encryptedPrivateKey}
							</code>
							<button
								type="button"
								onClick={togglePrivateKeyVisibility}
								className="flex-shrink-0 text-yellow-600 hover:text-yellow-800 text-sm flex items-center gap-1"
								aria-label={
									showPrivateKey ? "Hide private key" : "Show private key"
								}
							>
								{showPrivateKey ? (
									<>
										<EyeSlashIcon className="w-4 h-4" />
										<span>{t("hide")}</span>
									</>
								) : (
									<>
										<EyeIcon className="w-4 h-4" />
										<span>{t("show")}</span>
									</>
								)}
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
