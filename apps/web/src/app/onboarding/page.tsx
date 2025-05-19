"use client";

import { useCreateWallet } from "@chipi-pay/chipi-sdk";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { completeOnboarding } from "./_actions";
import type { WalletResponse } from "~/types";

interface ApiResponse {
	success: boolean;
	txHash: string;
	wallet: string;
	encryptedPrivateKey: string;
}

export default function OnboardingPage() {
	const { t } = useTranslation();
	const router = useRouter();
	const { user } = useUser();
	const { createWalletAsync, createWalletResponse, isLoading, isError } = useCreateWallet();
	const [pin, setPin] = useState("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [walletCreated, setWalletCreated] = useState(false);
	const [response, setResponse] = useState<WalletResponse | null>(null);
	const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);

	const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
		setPin(value);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
			setErrorMessage("PIN must be exactly 4 digits");
			return;
		}

		try {
			setErrorMessage(null);
			console.log('Creating wallet...');
			
			// Intercept fetch to get the raw API response
			const originalFetch = window.fetch;
			let requestPublicKey: string | undefined;
			let apiTxHash: string | undefined;
			
			window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
				const url = input instanceof URL ? input.href : input.toString();
				
				// Capture the request payload for the wallet creation
				if (url.includes("/chipi-wallets") && !url.includes("prepare-creation") && init?.body) {
					try {
						const payload = JSON.parse(init.body as string);
						requestPublicKey = payload.publicKey;
					} catch (e) {
						throw new Error("Failed to parse request payload");
					}
				}
				
				const response = await originalFetch(input, init);
				
				if (url.includes("/chipi-wallets") && !url.includes("prepare-creation")) {
					const data = await response.clone().json() as ApiResponse;
					setApiResponse(data);
					apiTxHash = data.txHash;
				}
				return response;
			};

			// Create wallet
			const response = await createWalletAsync(pin);
			setResponse(response);

			// Restore original fetch
			window.fetch = originalFetch;
			
			if (!response || !response.success) {
				throw new Error("Failed to create wallet - invalid response");
			}

			const { encryptedPrivateKey } = response.wallet;

			if (!encryptedPrivateKey) {
				throw new Error("Invalid wallet data received from server");
			}

			// Use the public key from the request payload
			const publicKey = requestPublicKey;

			if (!publicKey) {
				throw new Error("Public key not found in request payload");
			}

			// Use the transaction hash from the API response
			const txHash = apiTxHash;

			if (!txHash) {
				throw new Error("Transaction hash not found in API response");
			}

			// Save wallet data to user metadata
			if (user?.id) {
				const walletData = {
					encryptedPrivateKey,
					publicKey,
					address: publicKey,
					txHash,
				};
				await completeOnboarding(user.id, walletData);
			} else {
				throw new Error("User not authenticated");
			}

			setWalletCreated(true);
			
		} catch (err) {
			console.error("Wallet creation failed:", err);
			setErrorMessage(
				err instanceof Error 
					? err.message 
					: "Failed to create wallet - please try again"
			);
			setWalletCreated(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
					{t("onboarding.title")}
				</h2>
				<p className="mt-2 text-center text-sm text-gray-600">
					{t("onboarding.subtitle")}
				</p>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
					{!walletCreated ? (
						<form onSubmit={handleSubmit} className="space-y-6">
							<div>
								<label
									htmlFor="pin"
									className="block text-sm font-medium text-gray-700"
								>
									{t("onboarding.pin_label")}
								</label>
								<div className="mt-1">
									<input
										id="pin"
										name="pin"
										type="text"
										inputMode="numeric"
										pattern="[0-9]*"
										maxLength={4}
										required
										value={pin}
										onChange={handlePinChange}
										className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
										placeholder={t("onboarding.pin_placeholder")}
									/>
								</div>
								<p className="mt-2 text-sm text-gray-500">
									{t("onboarding.pin_length", { length: pin.length })}
								</p>
							</div>

							{(isError || errorMessage) && (
								<div className="rounded-md bg-red-50 p-4">
									<div className="flex">
										<div className="ml-3">
											<h3 className="text-sm font-medium text-red-800">
												{t("onboarding.error_title")}
											</h3>
											<div className="mt-2 text-sm text-red-700">
												{errorMessage ?? "Failed to create wallet"}
											</div>
										</div>
									</div>
								</div>
							)}

							<button
								type="submit"
								disabled={isLoading || pin.length !== 4}
								className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:bg-gray-400"
							>
								{isLoading ? t("onboarding.creating") : t("onboarding.create_button")}
							</button>
						</form>
					) : (
						<div className="space-y-6">
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<h3 className="text-lg font-medium">{t("onboarding.wallet_created")}</h3>
									{response?.accountAddress && (
										<a
											href={`https://starkscan.co/contract/${response.accountAddress}`}
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
												aria-label="External link icon"
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
								<div className="space-y-2">
									<div className="text-sm">
										<span className="font-medium">{t("onboarding.status")}: </span>
										<span className="font-mono">
											{t("onboarding.wallet_created_message")}
										</span>
									</div>
									{response?.accountAddress && (
										<div className="text-sm">
											<span className="font-medium">{t("onboarding.contract_address")}: </span>
											<div className="flex items-center gap-2">
												<span className="font-mono break-all">
													{response.accountAddress}
												</span>
											</div>
										</div>
									)}
									{apiResponse?.wallet && (
										<div className="text-sm">
											<span className="font-medium">{t("public_key")}: </span>
											<div className="flex items-center gap-2">
												<span className="font-mono break-all">
													{apiResponse.wallet}
												</span>
											</div>
										</div>
									)}
									{response?.txHash && (
										<div className="text-sm">
											<span className="font-medium">{t("transaction_hash")}: </span>
											<div className="flex items-center gap-2">
												<span className="font-mono break-all">
													{response.txHash}
												</span>
												<a
													href={`https://starkscan.co/tx/${response.txHash}`}
													target="_blank"
													rel="noopener noreferrer"
													className="text-yellow-600 hover:text-yellow-800 text-sm flex items-center gap-1"
												>
													{t("view_tx")}
													<svg
														className="w-4 h-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
														aria-hidden="true"
														aria-label="External link icon"
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
									<div className="text-sm text-gray-500 mt-2">
										{t("onboarding.wallet_saved")}
									</div>
								</div>
							</div>

							{/* Continue Button */}
							<div className="mt-6 pt-6 border-t border-gray-200">
								<button
									type="button"
									onClick={() => router.push("/marketplace")}
									className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
								>
									{t("onboarding.continue_button")}
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}