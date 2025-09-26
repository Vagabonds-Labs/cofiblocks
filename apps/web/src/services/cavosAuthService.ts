import { CavosAuth } from "cavos-service-sdk";

// Environment variables
const NETWORK = process.env.NEXT_PUBLIC_CAVOS_NETWORK ?? "sepolia";
const APP_ID = process.env.NEXT_PUBLIC_CAVOS_APP_ID ?? "";
const ORG_SECRET = process.env.NEXT_PUBLIC_CAVOS_ORG_SECRET ?? "";

// Initialize Cavos Auth
const cavosAuth = new CavosAuth(NETWORK, APP_ID);

// Storage keys
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const WALLET_ADDRESS_KEY = "walletAddress";
const USER_EMAIL_KEY = "userEmail";

export interface CavosAuthResponse {
	user: {
		id: string;
		email: string;
	};
	wallet: {
		address: string;
	};
	access_token: string;
	refresh_token: string;
}

/**
 * Sign in with email and password
 */
export const signIn = async (
	email: string,
	password: string,
): Promise<CavosAuthResponse> => {
	if (!ORG_SECRET) {
		throw new Error("Missing organization secret");
	}

	const result = (await cavosAuth.signIn(
		email,
		password,
		ORG_SECRET,
	)) as CavosAuthResponse;

	if (
		result?.user &&
		result?.wallet?.address &&
		result?.access_token &&
		result?.refresh_token
	) {
		// Store auth data
		localStorage.setItem(ACCESS_TOKEN_KEY, result.access_token);
		localStorage.setItem(REFRESH_TOKEN_KEY, result.refresh_token);
		localStorage.setItem(WALLET_ADDRESS_KEY, result.wallet.address);
		localStorage.setItem(USER_EMAIL_KEY, email);

		return result;
	}

	throw new Error("Invalid login response");
};

/**
 * Sign up with email and password
 */
export const signUp = async (
	email: string,
	password: string,
): Promise<CavosAuthResponse> => {
	if (!ORG_SECRET) {
		throw new Error("Missing organization secret");
	}

	const result = (await cavosAuth.signUp(
		email,
		password,
		ORG_SECRET,
	)) as CavosAuthResponse;

	if (
		result?.user &&
		result?.wallet?.address &&
		result?.access_token &&
		result?.refresh_token
	) {
		// Store auth data
		localStorage.setItem(ACCESS_TOKEN_KEY, result.access_token);
		localStorage.setItem(REFRESH_TOKEN_KEY, result.refresh_token);
		localStorage.setItem(WALLET_ADDRESS_KEY, result.wallet.address);
		localStorage.setItem(USER_EMAIL_KEY, email);

		return result;
	}

	throw new Error("Invalid registration response");
};

/**
 * Sign out the current user
 */
export const signOut = (): void => {
	localStorage.removeItem(ACCESS_TOKEN_KEY);
	localStorage.removeItem(REFRESH_TOKEN_KEY);
	localStorage.removeItem(WALLET_ADDRESS_KEY);
	localStorage.removeItem(USER_EMAIL_KEY);
};

/**
 * Check if the user is authenticated
 */
export const isAuthenticated = (): boolean => {
	if (typeof window === "undefined") return false;

	const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
	const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
	const walletAddress = localStorage.getItem(WALLET_ADDRESS_KEY);

	return !!(accessToken && refreshToken && walletAddress);
};

/**
 * Get the current user's wallet address
 */
export const getWalletAddress = (): string | null => {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(WALLET_ADDRESS_KEY);
};

/**
 * Get the current user's email
 */
export const getUserEmail = (): string | null => {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(USER_EMAIL_KEY);
};

/**
 * Get the access token
 */
export const getAccessToken = (): string | null => {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Process authentication callback (for OAuth flows like Google Sign-In)
 */
export const processAuthCallback = (
	accessToken: string | null,
	refreshToken: string | null,
	walletAddress: string | null,
): boolean => {
	if (!accessToken || !refreshToken || !walletAddress) {
		return false;
	}

	// Store tokens and wallet address
	localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
	localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
	localStorage.setItem(WALLET_ADDRESS_KEY, walletAddress);

	return true;
};

/**
 * Create a React auth hook
 */
export const useCavosAuth = () => {
	if (typeof window === "undefined") {
		return {
			isAuthenticated: false,
			walletAddress: null,
			userEmail: null,
			signIn,
			signUp,
			signOut,
		};
	}

	return {
		isAuthenticated: isAuthenticated(),
		walletAddress: getWalletAddress(),
		userEmail: getUserEmail(),
		signIn,
		signUp,
		signOut,
	};
};

const cavosAuthService = {
	signIn,
	signUp,
	signOut,
	isAuthenticated,
	getWalletAddress,
	getUserEmail,
	getAccessToken,
	processAuthCallback,
	useCavosAuth,
};

export default cavosAuthService;
