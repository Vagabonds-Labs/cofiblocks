"use client";

import { useCreateWallet } from "@chipi-pay/chipi-sdk";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { UnsafeMetadata, WalletResponse } from "~/types";
import { completeOnboarding } from "./_actions";

interface ApiResponse {
	success: boolean;
	txHash: string;
	wallet: string;
	encryptedPrivateKey: string;
}

export default function OnboardingPage() {
	const { t } = useTranslation();
	const router = useRouter();
	const { user, isLoaded: userLoaded } = useUser();
	const { createWalletAsync, createWalletResponse, isLoading, isError } =
		useCreateWallet();
	const { getToken } = useAuth();
	const [pin, setPin] = useState("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [walletCreated, setWalletCreated] = useState(false);
	const [response, setResponse] = useState<WalletResponse | null>(null);
	const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
	const [isRedirecting, setIsRedirecting] = useState(false);
	const [isCheckingWallet, setIsCheckingWallet] = useState(true);

	// Check if user already has a wallet and redirect to marketplace if they do
	useEffect(() => {
		if (userLoaded && user) {
			const metadata = user.unsafeMetadata as UnsafeMetadata | undefined;
			const hasWallet = !!(metadata?.wallet || metadata?.walletCreated);

			if (hasWallet) {
				console.log(
					"[onboarding] User already has a wallet, redirecting to marketplace",
				);
				router.push("/marketplace");
			} else {
				setIsCheckingWallet(false);
			}
		} else if (userLoaded) {
			// User is loaded but not authenticated
			setIsCheckingWallet(false);
		}
	}, [userLoaded, user, router]);

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
			console.log("Creating PIN...");

			// Intercept fetch to get the raw API response
			const originalFetch = window.fetch;
			let requestPublicKey: string | undefined;
			let apiTxHash: string | undefined;

			window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
				const url =
					input instanceof URL
						? input.href
						: input instanceof Request
							? input.url
							: input;

				// Capture the request payload for the wallet creation
				if (
					url.includes("/chipi-wallets") &&
					!url.includes("prepare-creation") &&
					init?.body
				) {
					try {
						const payload = JSON.parse(init.body as string) as {
							publicKey?: string;
						};
						requestPublicKey = payload.publicKey;
					} catch (e) {
						throw new Error("Failed to parse request payload");
					}
				}

				const response = await originalFetch(input, init);

				if (
					url.includes("/chipi-wallets") &&
					!url.includes("prepare-creation")
				) {
					const data = (await response.clone().json()) as ApiResponse;
					setApiResponse(data);
					apiTxHash = data.txHash;
				}
				return response;
			};

			const token = await getToken({ template: "cofiblocks" });
			console.log("Token received:", token);
			if (!token) {
				throw new Error("No bearer token found");
			}
			const response = await createWalletAsync({
				encryptKey: pin,
				bearerToken: token,
			});
			console.log("createWalletAsync response:", response);
			setResponse(response);

			// Restore original fetch
			window.fetch = originalFetch;

			if (!response?.success) {
				throw new Error("Failed to create PIN - invalid response");
			}

			const { encryptedPrivateKey } = response.wallet;

			if (!encryptedPrivateKey) {
				throw new Error("Invalid account data received from server");
			}

			// Use the public key from the request payload
			const publicKey = requestPublicKey;

			if (!publicKey) {
				throw new Error("Account ID not found in request payload");
			}

			// Use the transaction hash from the API response
			const txHash = apiTxHash;

			if (!txHash) {
				throw new Error("Transaction ID not found in API response");
			}

			// Save account data to user metadata
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
			console.error("PIN creation failed:", err);
			setErrorMessage(
				err instanceof Error
					? err.message
					: "Failed to create PIN - please try again",
			);
			setWalletCreated(false);
		}
	};

	const handleContinue = async () => {
		try {
			setIsRedirecting(true);
			console.log("Starting redirection to marketplace...");

			// Add a small delay to ensure the session is updated
			await new Promise((resolve) => setTimeout(resolve, 1000));

			console.log("Delay completed, attempting to redirect...");
			// Use window.location.href for a full page reload
			window.location.href = "/marketplace";
		} catch (error) {
			console.error("Error during redirection:", error);
			setIsRedirecting(false);
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
					{isCheckingWallet ? (
						<div className="flex justify-center items-center py-6">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
							<span className="ml-2 text-gray-600">{t("loading")}</span>
						</div>
					) : !walletCreated ? (
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
												{errorMessage ?? "Failed to create PIN"}
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
								{isLoading
									? t("onboarding.creating")
									: t("onboarding.create_button")}
							</button>
						</form>
					) : (
						<div className="space-y-6">
							<div className="space-y-4">
								<div className="text-center mb-6">
									<div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
										<svg
											className="w-6 h-6 text-green-600"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
											aria-hidden="true"
										>
											<title>Success checkmark</title>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
									</div>
									<h3 className="text-xl font-medium text-gray-900">
										{t("onboarding.success_title")}
									</h3>
									<p className="mt-2 text-sm text-gray-600">
										{t("onboarding.success_message")}
									</p>
								</div>

								<div className="bg-gray-50 rounded-lg p-4">
									<div className="space-y-3">
										<div className="flex flex-col">
											<span className="text-sm text-gray-500">
												{t("onboarding.wallet_ready")}
											</span>
											<span className="font-medium">
												{t("onboarding.ready_message")}
											</span>
										</div>
									</div>
								</div>

								<div className="text-sm text-gray-500 mt-2">
									<p>{t("onboarding.whats_next")}</p>
									<ul className="list-disc pl-5 mt-2 space-y-1">
										<li>{t("onboarding.next_step_1")}</li>
										<li>{t("onboarding.next_step_2")}</li>
									</ul>
								</div>
							</div>

							{/* Continue Button */}
							<div className="mt-6 pt-6 border-t border-gray-200">
								<button
									type="button"
									onClick={handleContinue}
									disabled={isRedirecting}
									className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:bg-gray-400"
								>
									{isRedirecting
										? t("onboarding.redirecting")
										: t("onboarding.continue_button")}
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
