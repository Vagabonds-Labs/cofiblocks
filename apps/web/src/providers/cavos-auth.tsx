"use client";

import { CavosAuth } from "cavos-service-sdk";
import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

// Define the structure of a Cavos user
export interface CavosUser {
	id: string;
	email: string;
	walletAddress?: string;
	name?: string;
}

// Define the structure of the Cavos auth response
export interface CavosAuthResponse {
	user: {
		id: string;
		email: string;
		[key: string]: unknown;
	};
	wallet?: {
		address: string;
		[key: string]: unknown;
	};
	access_token: string;
	refresh_token: string;
	[key: string]: unknown;
}

// Define the context type
interface CavosAuthContextType {
	user: CavosUser | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	signIn: (email: string, password: string) => Promise<CavosAuthResponse>;
	signUp: (email: string, password: string) => Promise<CavosAuthResponse>;
	signOut: () => void;
	refreshSession: () => void;
	error: string | null;
}

// Initialize Cavos Auth using environment variables
const NETWORK = process.env.NEXT_PUBLIC_CAVOS_NETWORK ?? "sepolia";
const APP_ID = process.env.NEXT_PUBLIC_CAVOS_APP_ID ?? "";
const ORG_SECRET = process.env.NEXT_PUBLIC_CAVOS_ORG_SECRET ?? "";

// Environment variables are loaded

// Try initializing with organization token
const cavosAuth = new CavosAuth(NETWORK, APP_ID);

const CavosAuthContext = createContext<CavosAuthContextType | undefined>(
	undefined,
);

export function CavosAuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<CavosUser | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Function to check and restore session from localStorage
	const checkSession = async () => {
		try {
			const accessToken = localStorage.getItem("accessToken");
			const refreshToken = localStorage.getItem("refreshToken");
			const walletAddress = localStorage.getItem("walletAddress");
			const userEmail = localStorage.getItem("userEmail");
			const userId = localStorage.getItem("userId");
			const oauthLogin = localStorage.getItem("oauthLogin");
			const pendingGoogleAuth = localStorage.getItem("pendingGoogleAuth");

			console.log("Auth provider checking session:", {
				hasAccessToken: !!accessToken,
				hasRefreshToken: !!refreshToken,
				hasWalletAddress: !!walletAddress,
				hasUserEmail: !!userEmail,
				hasUserId: !!userId,
				isOAuthLogin: !!oauthLogin,
				isPendingGoogleAuth: !!pendingGoogleAuth,
			});

			// For Google OAuth login, we're more lenient about required fields
			if (oauthLogin === "true") {
				console.log("Restoring OAuth session");

				// For OAuth logins, we only need an email to show as authenticated
				if (userEmail) {
					// Create a user object with available data
					setUser({
						id: userId ?? `oauth-user-${Date.now()}`,
						email: userEmail,
						walletAddress: walletAddress ?? "",
					});
					return;
				}
			}

			// For regular login or any login with sufficient data
			if (accessToken && refreshToken && userEmail && userId) {
				console.log("Restoring regular session");

				setUser({
					id: userId ?? `user-${Date.now()}`,
					email: userEmail,
					walletAddress: walletAddress ?? "",
				});
			} else {
				console.log("No valid session found");
				setUser(null);
			}
		} catch (error) {
			console.error("Error checking session:", error);
			setError("Failed to restore session");
		} finally {
			setIsLoading(false);
		}
	};

	// Check for existing session on mount and whenever localStorage changes
	// Using a ref to avoid dependency cycle with checkSession
	const checkSessionRef = React.useRef(checkSession);
	checkSessionRef.current = checkSession;

	useEffect(() => {
		// Run on mount
		void checkSessionRef.current();

		// Set up storage event listener to detect changes from other tabs
		const handleStorageChange = () => {
			void checkSessionRef.current();
		};

		if (typeof window !== "undefined") {
			window.addEventListener("storage", handleStorageChange);
		}

		return () => {
			if (typeof window !== "undefined") {
				window.removeEventListener("storage", handleStorageChange);
			}
		};
	}, []);

	const signIn = async (
		email: string,
		password: string,
	): Promise<CavosAuthResponse> => {
		setIsLoading(true);
		setError(null);

		try {
			if (!ORG_SECRET) {
				throw new Error("Missing organization secret");
			}

			const result = (await cavosAuth.signIn(
				email,
				password,
				ORG_SECRET,
			)) as CavosAuthResponse;

			// Process signin response

			// Handle different response formats
			let userData: Record<string, unknown> | undefined;
			let walletData: Record<string, unknown> | undefined;
			let accessToken: unknown;
			let refreshToken: unknown;

			// Check for data property format (like in signup)
			if (
				result &&
				typeof result === "object" &&
				"data" in result &&
				result.data &&
				typeof result.data === "object"
			) {
				const data = result.data as Record<string, unknown>;
				userData = {
					id: data.user_id,
					email: data.email,
					...data,
				};
				walletData = data.wallet as Record<string, unknown>;
				// Check for tokens in authData
				const authData = data.authData as Record<string, unknown>;
				accessToken =
					authData?.accessToken ?? authData?.access_token ?? authData?.token;
				refreshToken = authData?.refreshToken ?? authData?.refresh_token;
			} else {
				// Check for direct format
				userData = result?.user;
				walletData = result?.wallet;
				accessToken = result?.access_token;
				refreshToken = result?.refresh_token;
			}

			// Validate parsed data

			if (userData && walletData && accessToken && refreshToken) {
				const userId =
					typeof userData.id === "string"
						? userData.id
						: typeof userData._id === "string"
							? userData._id
							: "unknown";
				const userEmail =
					typeof userData.email === "string" ? userData.email : "";
				const walletAddress =
					typeof walletData.address === "string" ? walletData.address : "";

				// Store tokens and user info in localStorage (client-side)
				localStorage.setItem("accessToken", accessToken as string);
				localStorage.setItem("refreshToken", refreshToken as string);
				localStorage.setItem("walletAddress", walletAddress);
				localStorage.setItem("userEmail", userEmail);
				localStorage.setItem("userId", userId);

				setUser({
					id: userId,
					email: userEmail,
					walletAddress: walletAddress,
				});

				return result;
			}

			throw new Error("Invalid login response");
		} catch (error) {
			if (error instanceof Error) {
				setError(error.message);
			} else {
				setError("An unknown error occurred");
			}
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	function getUserError(err: unknown): string {
		const e = err as {
			response?: {
				data?: {
					error?: string;
					message?: string;
				};
			};
			message?: string;
		};

		// 1) Axios-style
		if (e?.response?.data) {
			return (
				e.response.data.error ??
				e.response.data.message ??
				e.message ??
				"Unexpected error"
			);
		}

		// 4) Fallback: parse trailing JSON from message
		if (typeof e?.message === "string") {
			const m = /{[\s\S]*}$/.exec(e.message); // last {...} in the message
			if (m) {
				try {
					const json = JSON.parse(m[0]) as Record<string, unknown>;
					const errorMsg = json.error ?? json.message ?? e.message ?? 'Unknown error';
					return typeof errorMsg === 'string' ? errorMsg : 'Unknown error';
				} catch {
					// ignore
				}
			}
			return e.message;
		}

		return "Unexpected error";
	}

	const signUp = async (
		email: string,
		password: string,
	): Promise<CavosAuthResponse> => {
		setIsLoading(true);
		setError(null);

		try {
			if (!ORG_SECRET) {
				throw new Error("Missing organization secret");
			}

			// Attempting sign up
			const result = (await cavosAuth.signUp(
				email,
				password,
				ORG_SECRET,
			)) as CavosAuthResponse;

			// Check for data property as in the example
			if (
				result &&
				typeof result === "object" &&
				"data" in result &&
				result.data &&
				typeof result.data === "object" &&
				"email" in result.data &&
				"wallet" in result.data &&
				result.data.wallet &&
				typeof result.data.wallet === "object" &&
				"data" in result.data.wallet &&
				result.data.wallet.data &&
				typeof result.data.wallet.data === "object" &&
				"address" in result.data.wallet.data
			) {
				const data = result.data as Record<string, unknown>;
				const wallet = data.wallet as Record<string, unknown>;
				const walletData = wallet.data as Record<string, unknown>;
				const resultObj = result as Record<string, unknown>;

				// Create a compatible response format
				const compatibleResult = {
					user: {
						id:
							typeof data.id === "string"
								? data.id
								: typeof data._id === "string"
									? data._id
									: "pending",
						email: typeof data.email === "string" ? data.email : "",
						// Only spread safe properties
						name: typeof data.name === "string" ? data.name : undefined,
						created_at: data.created_at,
					},
					wallet: {
						address:
							typeof walletData.address === "string" ? walletData.address : "",
					},
					access_token:
						typeof resultObj.access_token === "string"
							? resultObj.access_token
							: typeof resultObj.token === "string"
								? resultObj.token
								: "",
					refresh_token:
						typeof resultObj.refresh_token === "string"
							? resultObj.refresh_token
							: "",
				};

				return compatibleResult as CavosAuthResponse;
			}

			// Check for the original expected format
			if (
				result?.user &&
				result?.wallet?.data &&
				typeof result.wallet.data === "object" &&
				"address" in result.wallet.data &&
				typeof result.wallet.data.address === "string" &&
				result.wallet.data.address &&
				result?.access_token &&
				result?.refresh_token
			) {
				return result;
			}

			throw new Error("Invalid registration response");
		} catch (error) {
			// Handle specific error types with user-friendly messages
			if (error instanceof Error) {
				if (
					error.message.includes("USER_ALREADY_EXISTS") ||
					error.message.includes("409")
				) {
					// User already exists - they need to verify their email
					setError(
						"This email is already registered. Please check your email for verification instructions or try signing in.",
					);
				} else if (
					error.message.includes("INVALID_ORG_TOKEN") ||
					error.message.includes("401")
				) {
					setError(
						"Authentication service is temporarily unavailable. Please try again later.",
					);
				} else if (error.message.includes("Invalid organization token")) {
					setError(
						"Authentication service is temporarily unavailable. Please try again later.",
					);
				} else {
					setError(getUserError(error));
				}
			} else {
				setError(getUserError(error));
			}

			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const signOut = () => {
		// Clear local storage
		localStorage.removeItem("accessToken");
		localStorage.removeItem("refreshToken");
		localStorage.removeItem("walletAddress");
		localStorage.removeItem("userEmail");
		localStorage.removeItem("userId");
		localStorage.removeItem("oauthLogin");
		localStorage.removeItem("pendingGoogleAuth");

		// Clear user state
		setUser(null);
		setError(null);
	};

	const refreshSession = () => {
		void checkSession();
	};

	const contextValue: CavosAuthContextType = {
		user,
		isAuthenticated: !!user,
		isLoading,
		signIn,
		signUp,
		signOut,
		refreshSession,
		error,
	};

	return (
		<CavosAuthContext.Provider value={contextValue}>
			{children}
		</CavosAuthContext.Provider>
	);
}

export function useCavosAuth() {
	const context = useContext(CavosAuthContext);
	if (!context) {
		throw new Error("useCavosAuth must be used within a CavosAuthProvider");
	}
	return context;
}
