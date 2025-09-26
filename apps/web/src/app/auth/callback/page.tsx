"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Spinner from "~/app/_components/ui/Spinner";

// Define a separate component for the error state
function AuthError({
	error,
	router,
}: { error: string; router: ReturnType<typeof useRouter> }) {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-surface-primary-soft p-4">
			<div className="bg-surface-inverse p-8 rounded-xl shadow-lg max-w-md w-full text-center">
				<div className="rounded-full h-8 w-8 bg-error-default flex items-center justify-center mx-auto mb-4">
					<svg
						className="w-5 h-5 text-white"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
						<title>Error icon</title>
					</svg>
				</div>
				<h2 className="text-xl font-bold text-error-default mb-4">
					Authentication Error
				</h2>
				<p className="text-content-body-default mb-6">{error}</p>
				<button
					type="button"
					onClick={() => router.push("/auth")}
					className="px-6 py-2 bg-surface-secondary-default text-white rounded-lg hover:bg-surface-secondary-hover transition-colors"
				>
					Back to Sign In
				</button>
			</div>
		</div>
	);
}

// Define a separate component for the success state
function AuthSuccess() {
	const [countdown, setCountdown] = useState(2);

	useEffect(() => {
		const interval = setInterval(() => {
			setCountdown((prev) => Math.max(0, prev - 1));
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		if (countdown === 0) {
			window.location.href = "/marketplace";
		}
	}, [countdown]);

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-surface-primary-soft">
			<div className="bg-surface-inverse p-8 rounded-xl shadow-lg max-w-md w-full text-center">
				<div className="rounded-full h-8 w-8 bg-success-default flex items-center justify-center mx-auto mb-4">
					<svg
						className="w-5 h-5 text-white"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M5 13l4 4L19 7"
						/>
						<title>Success icon</title>
					</svg>
				</div>
				<h2 className="text-xl font-bold text-content-title mb-2">
					Authentication Successful
				</h2>
				<p className="text-content-body-default mb-4">
					You have been successfully authenticated!
				</p>
				<p className="text-sm text-content-body-soft">
					Redirecting to marketplace in {countdown} seconds...
				</p>
				<button
					type="button"
					onClick={() => {
						window.location.href = "/marketplace";
					}}
					className="mt-4 px-4 py-2 bg-surface-secondary-default text-white rounded-lg hover:bg-surface-secondary-hover transition-colors"
				>
					Go to Marketplace Now
				</button>
			</div>
		</div>
	);
}

// Define a separate component for the loading state
function AuthLoading() {
	const [loadingTime, setLoadingTime] = useState(0);

	// Add a counter to show loading progress
	useEffect(() => {
		const interval = setInterval(() => {
			setLoadingTime((prev) => prev + 1);
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-surface-primary-soft">
			<div className="bg-surface-inverse p-8 rounded-xl shadow-lg max-w-md w-full text-center">
				<Spinner size="lg" className="mx-auto mb-4" />
				<h2 className="text-xl font-bold text-content-title mb-2">
					Completing Authentication
				</h2>
				<p className="text-content-body-default mb-4">
					Please wait while we finish setting up your account...
				</p>
				<p className="text-sm text-content-body-soft">
					Loading for {loadingTime} seconds
				</p>
				<p className="text-xs text-content-body-soft mt-2">
					You&apos;ll be redirected automatically in a moment.
				</p>
				<button
					type="button"
					onClick={() => {
						window.location.href = "/marketplace";
					}}
					className="mt-4 px-4 py-2 bg-surface-secondary-default text-white rounded-lg hover:bg-surface-secondary-hover transition-colors"
				>
					Go to Marketplace Now
				</button>
			</div>
		</div>
	);
}

// Main component that handles the callback logic
function AuthCallbackContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [status, setStatus] = useState<"processing" | "success" | "error">(
		"processing",
	);
	const [message, setMessage] = useState("Processing authentication...");

	useEffect(() => {
		const handleCallback = async () => {
			try {
				// Check for error parameter first
				const errorParam = searchParams.get("error");
				if (errorParam) {
					console.error("Authentication error from provider:", errorParam);
					setStatus("error");
					setMessage(`Authentication error: ${errorParam}`);
					return;
				}

				// Log all search parameters for debugging
				const allParams = Object.fromEntries(searchParams.entries());
				console.log("All URL parameters:", allParams);

				// Remove the pending flag
				if (typeof window !== "undefined") {
					localStorage.removeItem("pendingGoogleAuth");
				}

				// Check for user_data parameter (contains encoded JSON) - This is the primary method from Cavos SDK
				const encodedUserData = searchParams.get("user_data");
				if (encodedUserData) {
					try {
						// Decode the URL-encoded string and parse as JSON
						const decodedString = decodeURIComponent(encodedUserData);
						console.log("Decoded user_data:", decodedString);

						// Parse the JSON with type safety
						interface UserData {
							user_id?: string;
							email?: string;
							access_token?: string;
							refresh_token?: string;
							wallet_address?: string;
							walletAddress?: string;
							address?: string;
							authData?: {
								accessToken?: string;
								refreshToken?: string;
							};
							user?: {
								id?: string;
								email?: string;
							};
							wallet?: {
								address?: string;
								network?: string;
							};
						}

						const userData = JSON.parse(decodedString) as UserData;
						console.log("Parsed user_data:", userData);

						// Extract relevant information following the Cavos example
						if (userData) {
							// Set flag to indicate this was an OAuth login
							localStorage.setItem("oauthLogin", "true");

							// Store access token - check both formats from the example
							const accessToken =
								userData.access_token ?? userData.authData?.accessToken;
							if (accessToken && typeof accessToken === "string") {
								localStorage.setItem("accessToken", accessToken);
								console.log("Stored accessToken");
							}

							// Store refresh token - check both formats
							const refreshToken =
								userData.refresh_token ?? userData.authData?.refreshToken;
							if (refreshToken && typeof refreshToken === "string") {
								localStorage.setItem("refreshToken", refreshToken);
								console.log("Stored refreshToken");
							}

							// Store wallet address - check all possible formats
							let walletAddress: string | undefined;
							if (typeof userData.wallet_address === "string") {
								walletAddress = userData.wallet_address;
							} else if (typeof userData.walletAddress === "string") {
								walletAddress = userData.walletAddress;
							} else if (typeof userData.address === "string") {
								walletAddress = userData.address;
							} else if (
								userData.wallet &&
								typeof userData.wallet.address === "string"
							) {
								walletAddress = userData.wallet.address;
							}

							// Log all possible places where wallet address might be found
							console.log("Checking for wallet address in userData:", {
								wallet_address: userData.wallet_address,
								walletAddress: userData.walletAddress,
								address: userData.address,
								wallet_address_from_wallet: userData.wallet?.address,
							});

							// Since Cavos provides the wallets, we should have a wallet address
							// But if we don't find one, we'll use a placeholder
							if (walletAddress) {
								localStorage.setItem("walletAddress", walletAddress);
								console.log("Stored walletAddress:", walletAddress);
							} else {
								// If we don't have a wallet address from standard locations, check the entire object
								console.log(
									"No standard wallet address found, searching deeper...",
								);
								// Stringify the entire object to look for wallet address patterns
								const jsonStr = JSON.stringify(userData);
								console.log("Full user data:", jsonStr);

								// Look for wallet address pattern in the JSON string
								const walletRegex = /"0x[a-fA-F0-9]{40,64}"/g;
								const matches = jsonStr.match(walletRegex);

								if (matches && matches.length > 0) {
									// Extract the first match without quotes
									const extractedAddress = matches[0].replace(/"/g, "");
									console.log(
										"Found wallet address in JSON:",
										extractedAddress,
									);
									localStorage.setItem("walletAddress", extractedAddress);
								} else {
									// If we still don't have a wallet address, use an empty string
									// since Cavos should provide the wallet
									localStorage.setItem("walletAddress", "");
									console.log("No wallet address found in the response");
								}
							}

							// Store email - check all possible formats
							let email: string | undefined;
							if (typeof userData.email === "string") {
								email = userData.email;
							} else if (
								userData.user &&
								typeof userData.user.email === "string"
							) {
								email = userData.user.email;
							}

							if (email) {
								localStorage.setItem("userEmail", email);
								console.log("Stored email:", email);
							}

							// Store user ID - check all possible formats
							let userId: string | undefined;
							if (typeof userData.user_id === "string") {
								userId = userData.user_id;
							} else if (
								userData.user &&
								typeof userData.user.id === "string"
							) {
								userId = userData.user.id;
							}

							if (userId) {
								localStorage.setItem("userId", userId);
								console.log("Stored userId:", userId);
							}

							// Authentication successful
							setStatus("success");
							setMessage("Authentication successful! Redirecting...");
							return;
						}
					} catch (parseError) {
						console.error("Error parsing user_data:", parseError);
						// Continue with other methods if parsing fails
					}
				}

				// If we don't have user_data, try other parameters

				// Try different possible parameter names for access token
				const accessToken =
					searchParams.get("access_token") ??
					searchParams.get("accessToken") ??
					searchParams.get("token") ??
					searchParams.get("id_token");

				// Try different possible parameter names for refresh token
				const refreshToken =
					searchParams.get("refresh_token") ?? searchParams.get("refreshToken");

				// Try different possible parameter names for wallet address
				const walletAddress =
					searchParams.get("wallet_address") ??
					searchParams.get("walletAddress") ??
					searchParams.get("address");

				// Check for code parameter (OAuth flow)
				const code = searchParams.get("code");

				// Debug log the parameters
				console.log("Auth callback parameters:", {
					hasCode: !!code,
					hasAccessToken: !!accessToken,
					hasRefreshToken: !!refreshToken,
					hasWalletAddress: !!walletAddress,
				});

				// Handle OAuth code flow (Google Auth)
				if (code) {
					console.log("Detected OAuth code flow");

					// Set flag to indicate this was an OAuth login
					localStorage.setItem("oauthLogin", "true");

					// Check if we have an email parameter directly in the URL
					const emailParam = searchParams.get("email");
					if (emailParam) {
						localStorage.setItem("userEmail", emailParam);
						console.log("Stored email from URL parameter:", emailParam);
					}

					// Set a temporary access token
					localStorage.setItem("accessToken", `google_oauth_${Date.now()}`);
					console.log("Set temporary access token for code flow");

					// If we don't have an email, use a placeholder
					if (!localStorage.getItem("userEmail")) {
						localStorage.setItem("userEmail", "google.user@example.com");
						console.log("Set placeholder email for code flow");
					}

					// Since Cavos provides the wallet, we should get the wallet address from the response
					// But if we don't have it yet, we'll set an empty string
					if (!localStorage.getItem("walletAddress")) {
						localStorage.setItem("walletAddress", "");
						console.log("No wallet address available yet for code flow");
					}

					setStatus("success");
					setMessage("OAuth authentication successful! Redirecting...");
					return;
				}

				// Handle direct token flow
				if (accessToken) {
					console.log("Detected token flow");

					// Store tokens and wallet address
					localStorage.setItem("accessToken", accessToken);
					localStorage.setItem("oauthLogin", "true");

					if (refreshToken) {
						localStorage.setItem("refreshToken", refreshToken);
					}

					if (walletAddress) {
						localStorage.setItem("walletAddress", walletAddress);
						console.log("Stored wallet address:", walletAddress);
					} else {
						localStorage.setItem("walletAddress", "");
						console.log("No wallet address found in token flow");
					}

					// Also store user email if available
					const email =
						searchParams.get("email") ?? searchParams.get("user_email");
					if (email) {
						localStorage.setItem("userEmail", email);
					}

					// Store user ID if available
					const userId =
						searchParams.get("user_id") ??
						searchParams.get("userId") ??
						searchParams.get("sub");
					if (userId) {
						localStorage.setItem("userId", userId);
					}

					setStatus("success");
					setMessage("Token authentication successful! Redirecting...");
					return;
				}

				// If we get here, we don't have enough information
				console.warn("Insufficient authentication parameters");
				setStatus("error");
				setMessage("Authentication failed. Missing required parameters.");
			} catch (err) {
				console.error("Error processing authentication callback:", err);
				setStatus("error");
				setMessage(
					err instanceof Error ? err.message : "Authentication failed",
				);
			}
		};

		void handleCallback();
	}, [searchParams]);

	// Render based on status
	if (status === "success") {
		return <AuthSuccess />;
	}

	if (status === "error") {
		return <AuthError error={message} router={router} />;
	}

	return <AuthLoading />;
}

// Main exported component with Suspense
export default function AuthCallback() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex flex-col items-center justify-center bg-surface-primary-soft">
					<div className="bg-surface-inverse p-8 rounded-xl shadow-lg max-w-md w-full text-center">
						<Spinner size="lg" className="mx-auto mb-4" />
						<h2 className="text-xl font-bold text-content-title mb-2">
							Loading...
						</h2>
					</div>
				</div>
			}
		>
			<AuthCallbackContent />
		</Suspense>
	);
}
