"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useUser, useAuth } from "@clerk/nextjs";
import type { UnsafeMetadata, WalletResponse } from "~/types";
import { useCreateWallet } from "@chipi-pay/chipi-sdk";

export default function WalletDetails() {
	const { t } = useTranslation();
	const { user } = useUser();
	const { getToken } = useAuth();
	const [pin, setPin] = useState("");
	const [showPrivateKey, setShowPrivateKey] = useState(false);
	const [privateKey, setPrivateKey] = useState("");
	const [error, setError] = useState<string | null>(null);
	const { createWalletAsync } = useCreateWallet();

	const walletMetadata = (user?.unsafeMetadata as UnsafeMetadata | undefined)?.wallet;
	const hasWallet = !!walletMetadata?.encryptedPrivateKey;

	const handlePinSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (pin.length !== 4) {
			setError("PIN must be 4 digits");
			return;
		}

		try {
			setError(null);
			// Get a fresh token for authentication
			const token = await getToken();
			if (!token) {
				throw new Error("Not authenticated");
			}
			// Set the token with Bearer prefix for the SDK to use
			window.localStorage.setItem("chipi_auth_token", `Bearer ${token}`);

			// Use the SDK to decrypt the private key
			const response = await createWalletAsync(pin);
			if (!response?.success || !response.wallet?.encryptedPrivateKey) {
				throw new Error("Failed to decrypt private key");
			}

			// The decrypted private key is returned in the encryptedPrivateKey field
			setPrivateKey(response.wallet.encryptedPrivateKey);
			setShowPrivateKey(true);
		} catch (err) {
			console.error("Failed to decrypt:", err);
			setError("Invalid PIN");
		}
	};

	if (!hasWallet) {
		return null;
	}

	return (
		<div className="mt-6">
			<h3 className="text-lg font-medium text-gray-900 mb-2">
				{t("wallet_info")}
			</h3>
			<div className="bg-gray-50 p-4 rounded-md space-y-3">
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
								View on Starkscan
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
							{walletMetadata.txHash && (
								<a
									href={`https://starkscan.co/tx/${walletMetadata.txHash}`}
									target="_blank"
									rel="noopener noreferrer"
									className="text-yellow-600 hover:text-yellow-800 text-sm flex items-center gap-1"
								>
									View TX
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
							)}
						</div>
					</div>
				)}

				{/* Encrypted Private Key */}
				<div className="flex flex-col">
					<span className="font-medium text-sm">{t("encrypted_key")}:</span>
					<code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono break-all">
						{walletMetadata.encryptedPrivateKey}
					</code>
				</div>

				{/* Private Key Decryption Form */}
				<div className="mt-4 pt-4 border-t border-gray-200">
					<form onSubmit={handlePinSubmit} className="space-y-3">
						<div>
							<label htmlFor="pin" className="block text-sm font-medium text-gray-700">
								Enter PIN to view private key
							</label>
							<input
								type="password"
								id="pin"
								maxLength={4}
								value={pin}
								onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
								placeholder="Enter your 4-digit PIN"
							/>
						</div>
						{error && (
							<p className="text-sm text-red-600">{error}</p>
						)}
						<button
							type="submit"
							disabled={pin.length !== 4}
							className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:bg-gray-400"
						>
							Decrypt Private Key
						</button>
					</form>

					{showPrivateKey && privateKey && (
						<div className="mt-4">
							<div className="flex flex-col">
								<span className="font-medium text-sm">Private Key:</span>
								<code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono break-all">
									{privateKey}
								</code>
							</div>
							<p className="mt-2 text-sm text-red-600">
								Warning: Never share your private key with anyone!
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
} 