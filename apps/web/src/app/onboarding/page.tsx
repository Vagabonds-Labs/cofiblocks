"use client";

import { useCreateWallet } from "@chipi-pay/chipi-sdk";
import { useUser, useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { WalletData, UnsafeMetadata, WalletResponse } from "~/types";

export default function OnboardingPage() {
	const router = useRouter();
	const { user } = useUser();
	const { getToken } = useAuth();
	const { createWalletAsync, createWalletResponse, isLoading, isError } = useCreateWallet();
	const [pin, setPin] = useState("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [walletCreated, setWalletCreated] = useState(false);
	const [walletDetails, setWalletDetails] = useState<WalletResponse | null>(null);
	const [loading, setLoading] = useState(false);

	// Watch for createWalletResponse changes
	useEffect(() => {
		const updateMetadataWithAddress = async () => {
			if (createWalletResponse?.accountAddress && user) {
				console.log("Got wallet response with address:", createWalletResponse);
				
				// Get current metadata
				const currentMetadata = user.unsafeMetadata as UnsafeMetadata | undefined;
				const currentWallet = currentMetadata?.wallet ?? {
					encryptedPrivateKey: "",
					txHash: "",
					address: "",
				} as WalletData;
				
				// Only update if we don't have an address yet
				if (!currentWallet.address) {
					const addressUpdateMetadata = {
						...currentMetadata,
						wallet: {
							...currentWallet,
							address: createWalletResponse.accountAddress,
						},
					};
					console.log("Updating metadata with address from createWalletResponse:", addressUpdateMetadata);
					await user.update({
						unsafeMetadata: addressUpdateMetadata,
					});
				}
			}
		};
		
		void updateMetadataWithAddress();
	}, [createWalletResponse, user]);

	// Set up authentication token for Chipi SDK
	useEffect(() => {
		const setupAuth = async () => {
			try {
				const token = await getToken();
				if (token) {
					// Set the token with Bearer prefix for the SDK to use
					window.localStorage.setItem("chipi_auth_token", `Bearer ${token}`);
				}
			} catch (err) {
				console.error("Failed to set up authentication:", err);
				setErrorMessage("Failed to authenticate with wallet service");
			}
		};
		void setupAuth();
	}, [getToken]);

	const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
		setPin(value);
	};

	const createWallet = async (pin: string) => {
		setLoading(true);
		try {
			// Validate required environment variables
			const apiKey = process.env.NEXT_PUBLIC_CHIPI_API_KEY;
			const secretKey = process.env.NEXT_PUBLIC_CHIPI_SECRET_KEY;
			const appId = process.env.NEXT_PUBLIC_CHIPI_APP_ID;
			const nodeUrl = process.env.NEXT_PUBLIC_STARKNET_NODE_URL;
			const activateContractAddress = process.env.NEXT_PUBLIC_CHIPI_ACTIVATE_CONTRACT_ADDRESS;

			if (!apiKey || !secretKey || !appId || !nodeUrl || !activateContractAddress) {
				throw new Error("Missing required environment variables for wallet creation");
			}

			const walletParams = {
				apiKey,
				secretKey,
				appId,
				nodeUrl,
				activateContractAddress,
				activateContractEntryPoint: "initialize",
				network: "goerli",
				pin,
			};

			console.log("Creating wallet with params:", {
				...walletParams,
				pin: "[REDACTED]",
				secretKey: "[REDACTED]",
			});

			const response = await createWalletAsync(pin);
			setWalletDetails(response);

			// Save initial wallet data
			const currentMetadata = user?.unsafeMetadata as UnsafeMetadata | undefined;
			const initialMetadata = {
				...currentMetadata,
				wallet: {
					encryptedPrivateKey: response.wallet.encryptedPrivateKey,
					txHash: response.txHash,
					address: response.wallet.address,
				},
			};

			console.log("Initial metadata update:", initialMetadata);
			await user?.update({ unsafeMetadata: initialMetadata });

			// Start checking transaction status
			let confirmed = false;
			let attempts = 0;
			const maxAttempts = 24; // 2 minutes (5s * 24)

			while (!confirmed && attempts < maxAttempts) {
				attempts++;
				console.log(`Checking transaction status (attempt ${attempts}/${maxAttempts})...`);
				
				const status = await response.checkTransactionStatus();
				console.log("Transaction status:", status);

				if (status.confirmed) {
					confirmed = true;
					
					// Get fresh metadata to ensure we don't override any updates
					const currentMetadata = user?.unsafeMetadata as UnsafeMetadata | undefined;
					console.log("Current metadata before final update:", currentMetadata);
					
					const currentWallet = (currentMetadata?.wallet as WalletData) ?? {
						encryptedPrivateKey: response.wallet.encryptedPrivateKey,
						txHash: response.txHash,
						address: response.wallet.address,
					};
					
					// Attempt to activate the wallet
					try {
						console.log("Activating wallet...");
						if (response.wallet?.activate) {
							const activationResponse = await response.wallet.activate();
							console.log("Wallet activation successful, txHash:", activationResponse.txHash);
						} else {
							console.warn("Wallet activation method not available");
						}
					} catch (activationError) {
						console.warn("Error activating wallet:", activationError);
						// Continue with metadata update even if activation fails
					}
					
					// Update metadata with public key while preserving other fields
					const finalMetadata = {
						...currentMetadata,
						wallet: {
							...currentWallet,
							publicKey: status.publicKey,
							encryptedPrivateKey: currentWallet.encryptedPrivateKey,
							txHash: response.txHash,
							address: response.wallet.address,
						},
					};

					console.log("Final metadata update with addresses:", {
						publicKey: status.publicKey,
						currentAddress: currentWallet.address,
						finalAddress: response.wallet.address
					});

					await user?.update({ unsafeMetadata: finalMetadata });
					break;
				}

				await new Promise((resolve) => setTimeout(resolve, 5000));
			}

			if (!confirmed) {
				console.warn("Transaction not confirmed after maximum attempts");
			}

			setLoading(false);
			return response;
		} catch (error) {
			console.error("Error creating wallet:", error);
			setLoading(false);
			throw error;
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
			setErrorMessage("PIN must be exactly 4 digits");
			return;
		}

		try {
			// Ensure we have a fresh token before creating the wallet
			const token = await getToken();
			if (!token) {
				throw new Error("Not authenticated");
			}
			// Set the token with Bearer prefix
			window.localStorage.setItem("chipi_auth_token", `Bearer ${token}`);

			setErrorMessage(null);

			const response = await createWallet(pin);
			
			// Log the entire response to see its structure
			console.log("Full createWalletAsync response:", response);
			console.log("createWalletResponse from hook:", createWalletResponse);

			if (!response || !response.success || !response.wallet) {
				throw new Error("Failed to create wallet - invalid response");
			}

			const wallet = response.wallet;
			const { encryptedPrivateKey, publicKey } = wallet;

			if (!encryptedPrivateKey) {
				throw new Error("Invalid wallet data received from server");
			}

			// Get existing metadata to preserve other fields
			const existingMetadata = user?.unsafeMetadata ?? {};
			const existingWallet = (existingMetadata.wallet as WalletData | undefined) ?? {};

			// First update with initial wallet data
			const initialMetadata = {
				...existingMetadata,
				wallet: {
					...existingWallet,
					encryptedPrivateKey,
					publicKey, // Save the public key immediately if available
					txHash: response.txHash,
					address: publicKey, // The public key is the contract address
				},
			};

			console.log("Initial wallet data from response:", {
				publicKey,
				txHash: response.txHash,
				encryptedPrivateKey: "****" // Don't log the encrypted key
			});
			console.log("Saving initial wallet metadata:", initialMetadata);

			await user?.update({
				unsafeMetadata: initialMetadata,
			});

			// Wait a moment for the update to be processed
			await new Promise(resolve => setTimeout(resolve, 1000));

			// Verify the metadata was saved
			const updatedMetadata = user?.unsafeMetadata;
			console.log("Metadata after initial save:", updatedMetadata);

			// Set wallet details for display
			setWalletDetails(response);
			setWalletCreated(true);

			// Show success message
			setErrorMessage(null);

		} catch (err) {
			console.error("Wallet creation failed:", err);
			setErrorMessage(
				err instanceof Error 
					? err.message 
					: "Failed to create wallet - please try again"
			);
			setWalletCreated(false);
			setWalletDetails(null);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
					Create Your Wallet
				</h2>
				<p className="mt-2 text-center text-sm text-gray-600">
					Set up your StarkNet wallet to start using the platform
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
									Set PIN Code
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
										placeholder="Enter a 4-digit PIN"
									/>
								</div>
								<p className="mt-2 text-sm text-gray-500">
									{`PIN length: ${pin.length}/4 digits`}
								</p>
							</div>

							{(isError || errorMessage) && (
								<div className="rounded-md bg-red-50 p-4">
									<div className="flex">
										<div className="ml-3">
											<h3 className="text-sm font-medium text-red-800">
												Error creating wallet
											</h3>
											<div className="mt-2 text-sm text-red-700">
												{errorMessage || "Failed to create wallet"}
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
								{isLoading ? "Creating..." : "Create Wallet"}
							</button>
						</form>
					) : walletDetails && (
						<div className="space-y-6">
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<h3 className="text-lg font-medium">Wallet Details</h3>
									{walletDetails.accountAddress && (
										<a
											href={`https://starkscan.co/contract/${walletDetails.accountAddress}`}
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
									)}
								</div>
								<div className="space-y-2">
									<p className="text-sm">
										<span className="font-medium">Status: </span>
										<span className="font-mono">
											Wallet created successfully! Your private key has been encrypted with your PIN.
										</span>
									</p>
									<p className="text-sm">
										<span className="font-medium">Contract Address: </span>
										<div className="flex items-center gap-2">
											<span className="font-mono break-all">
												{walletDetails.accountAddress}
											</span>
										</div>
									</p>
									<p className="text-sm">
										<span className="font-medium">TX Hash: </span>
										<div className="flex items-center gap-2">
											<span className="font-mono break-all">
												{walletDetails.txHash}
											</span>
											<a
												href={`https://starkscan.co/tx/${walletDetails.txHash}`}
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
									</p>
									<p className="text-sm text-gray-500 mt-2">
										Your wallet is being created on StarkNet. Once the transaction is confirmed:
									</p>
									<ul className="text-sm text-gray-500 list-disc pl-5 space-y-1">
										<li>Your public key and wallet address will be available</li>
										<li>You can view your wallet on Starkscan</li>
										<li>You can start making transactions</li>
										<li>Your private key will remain encrypted and can only be used with your PIN</li>
									</ul>
								</div>
							</div>

							{/* Continue Button */}
							<div className="mt-6 pt-6 border-t border-gray-200">
								<button
									type="button"
									onClick={() => router.push("/marketplace")}
									className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
								>
									Continue to Marketplace
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}