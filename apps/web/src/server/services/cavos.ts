import type { PrismaClient } from "@prisma/client";
import axios from "axios";
import { generateSecurePassword } from "~/utils/passwordValidation";

const CAVOS_API_BASE = "https://services.cavos.xyz/api/v1/external";

export interface UserAuthData {
	user_id: string;
	email: string;
	wallet_address: string;
	wallet_public_key: string;
	access_token: string;
	refresh_token: string;
	expires_in: string;
	timestamp: string;
}

export interface TransactionDetails {
	contract_address: string;
	entrypoint: string;
	calldata: string[];
}

export interface WalletExportOTPResponse {
	success: boolean;
	data: {
		email: string;
		expiresIn: number;
		timestamp: number;
	};
	message: string;
}

export interface WalletExportVerifyResponse {
	success: boolean;
	data: {
		private_key: string;
		wallet_address: string;
		warning: string;
	};
	message: string;
}

const getHeaders = (token: string) => ({
	Authorization: `Bearer ${token}`,
	"Content-Type": "application/json",
});

const NETWORK = process.env.CAVOS_NETWORK;
const ORG_ID = process.env.CAVOS_APP_ID;
const API_SECRET = process.env.CAVOS_ORG_SECRET;

if (!NETWORK || !ORG_ID || !API_SECRET) {
	throw new Error(
		"Missing required environment variables: CAVOS_NETWORK, CAVOS_APP_ID, CAVOS_ORG_SECRET",
	);
}

export async function registerUserCavos(
	email: string,
	db: PrismaClient,
): Promise<UserAuthData> {
	// Check if user already exists in our database and authenticate them
	const existingUser = await db.userCavos.findUnique({
		where: { email: email, network: NETWORK },
	});
	if (existingUser) {
		const existingUserAuthData = await authenticateUser(
			email,
			existingUser.password,
		);
		await db.userCavos.update({
			where: { email: email, network: NETWORK },
			data: {
				accessToken: existingUserAuthData.access_token,
				accessExpiration: new Date(
					Number(existingUserAuthData.expires_in) * 1000 +
					Number(existingUserAuthData.timestamp),
				),
				refreshToken: existingUserAuthData.refresh_token,
				walletAddress: existingUserAuthData.wallet_address,
			},
		});
		return existingUserAuthData;
	}

	// If user doesn't exist, create them with a random password that we can access later to authenticate
	// Random password must have at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character
	const randomPassword = generateSecurePassword();
	const userAuthData = await registerUser(email, randomPassword);
	const accessExpiration = new Date(
		Number(userAuthData.expires_in) * 1000 + Number(userAuthData.timestamp),
	);

	// Create or update user with Cavos User data
	await db.userCavos.upsert({
		where: { email: email, network: NETWORK },
		update: {
			accessToken: userAuthData.access_token,
			accessExpiration: accessExpiration,
			refreshToken: userAuthData.refresh_token,
		},
		create: {
			email: email,
			walletAddress: userAuthData.wallet_address,
			password: randomPassword,
			network: NETWORK ?? "mainnet",
			accessToken: userAuthData.access_token,
			accessExpiration: accessExpiration,
			refreshToken: userAuthData.refresh_token,
		},
	});

	return userAuthData;
}

export async function authenticateUserCavos(
	email: string,
	db: PrismaClient,
): Promise<UserAuthData> {
	const existingUser = await db.userCavos.findUnique({
		where: { email: email, network: NETWORK },
	});
	if (!existingUser) {
		throw new Error("User not found");
	}
	const userAuthData = await authenticateUser(email, existingUser.password);
	return userAuthData;
}

export async function registerUser(
	email: string,
	password: string,
): Promise<UserAuthData> {
	if (!API_SECRET) {
		throw new Error("API_SECRET is required");
	}
	const payload = { email: email, password: password, network: NETWORK };
	const headers = getHeaders(API_SECRET);

	try {
		const res = await axios.post(`${CAVOS_API_BASE}/auth/register`, payload, {
			headers,
			validateStatus: () => true,
		});
		const responseData = res.data as Record<string, unknown>;
		if (responseData?.success !== true) {
			throw new Error(`Registration failed: ${JSON.stringify(responseData)}`);
		}

		const data = responseData?.data as Record<string, unknown>;
		if (!data || typeof data !== 'object') {
			throw new Error('Invalid response data');
		}

		const wallet = data.wallet as Record<string, unknown>;
		const walletData = wallet?.data as Record<string, unknown>;
		const authData = data.authData as Record<string, unknown>;

		return {
			user_id: typeof data.user_id === 'string' ? data.user_id : '',
			email: typeof data.email === 'string' ? data.email : '',
			wallet_public_key: typeof walletData?.public_key === 'string' ? walletData.public_key : '',
			wallet_address: typeof walletData?.address === 'string' ? walletData.address : '',
			access_token: typeof authData?.accessToken === 'string' ? authData.accessToken : '',
			refresh_token: typeof authData?.refreshToken === 'string' ? authData.refreshToken : '',
			expires_in: typeof authData?.expiresIn === 'string' ? authData.expiresIn : '',
			timestamp: typeof authData?.timestamp === 'string' ? authData.timestamp : '',
		};
	} catch (err) {
		throw new Error(`registerUser error: ${(err as Error).message}`);
	}
}

export async function authenticateUser(
	email: string,
	password: string,
): Promise<UserAuthData> {
	const payload = { email, password, network: NETWORK };
	if (!API_SECRET) {
		throw new Error("API_SECRET is required");
	}
	const headers = getHeaders(API_SECRET);

	try {
		const res = await axios.post(`${CAVOS_API_BASE}/auth/login`, payload, {
			headers,
			validateStatus: () => true,
		});
		const responseData = res.data as Record<string, unknown>;
		if (responseData?.success !== true) {
			throw new Error(`Authentication failed: ${JSON.stringify(responseData)}`);
		}

		const data = responseData?.data as Record<string, unknown>;
		if (!data || typeof data !== 'object') {
			throw new Error('Invalid response data');
		}

		const auth = data.authData as Record<string, unknown>;
		if (!auth || typeof auth !== 'object') {
			throw new Error('Invalid auth data');
		}

		console.log(auth);
		return {
			user_id: typeof data.user_id === 'string' ? data.user_id : '',
			email: typeof data.email === 'string' ? data.email : '',
			wallet_address: typeof (data.wallet as Record<string, unknown>)?.address === 'string' ? (data.wallet as Record<string, unknown>)?.address as string : '',
			wallet_public_key: typeof (data.wallet as Record<string, unknown>)?.public_key === 'string' ? (data.wallet as Record<string, unknown>)?.public_key as string : '',
			access_token: typeof auth.accessToken === 'string' ? auth.accessToken : '',
			refresh_token: typeof auth.refreshToken === 'string' ? auth.refreshToken : '',
			expires_in: typeof auth.expiresIn === 'string' ? auth.expiresIn : '',
			timestamp: typeof auth.timestamp === 'string' ? auth.timestamp : '',
		};
	} catch (err) {
		console.log(err);
		throw new Error(`authenticateUser error: ${(err as Error).message}`);
	}
}

export async function executeTransaction(
	userAuthData: UserAuthData,
	transaction: TransactionDetails,
): Promise<string> {
	const payload = {
		address: userAuthData.wallet_address,
		org_id: ORG_ID,
		calls: [
			{
				contractAddress: transaction.contract_address,
				entrypoint: transaction.entrypoint,
				calldata: transaction.calldata,
			},
		],
		network: NETWORK,
	};

	const headers = getHeaders(userAuthData.access_token);

	try {
		const res = await axios.post(`${CAVOS_API_BASE}/execute/session`, payload, {
			headers,
			validateStatus: () => true,
		});
		const responseData = res.data as Record<string, unknown>;
		if (responseData?.success !== true) {
			throw new Error(
				`Transaction execution failed: ${JSON.stringify(responseData)}`,
			);
		}
		const result = responseData?.result as Record<string, unknown>;
		const innerResult = result?.result as Record<string, unknown>;
		const transactionHash = innerResult?.transactionHash;
		return typeof transactionHash === 'string' ? transactionHash : '';
	} catch (err) {
		console.log(err);
		throw new Error(`executeTransaction error: ${(err as Error).message}`);
	}
}

export async function requestWalletExportOTP(
	userAuthData: UserAuthData,
): Promise<WalletExportOTPResponse> {
	const headers = getHeaders(userAuthData.access_token);

	try {
		const res = await axios.post(
			`${CAVOS_API_BASE}/wallet/export/request-otp`,
			{},
			{
				headers,
				validateStatus: () => true,
			},
		);
		const responseData = res.data as WalletExportOTPResponse;
		if (responseData?.success !== true) {
			throw new Error(
				`Failed to request OTP: ${JSON.stringify(responseData)}`,
			);
		}
		return responseData;
	} catch (err) {
		throw new Error(`requestWalletExportOTP error: ${(err as Error).message}`);
	}
}

export async function verifyWalletExportOTP(
	userAuthData: UserAuthData,
	otp: string,
): Promise<WalletExportVerifyResponse> {
	const headers = getHeaders(userAuthData.access_token);
	const payload = { otp };

	try {
		const res = await axios.post(
			`${CAVOS_API_BASE}/wallet/export/verify`,
			payload,
			{
				headers,
				validateStatus: () => true,
			},
		);
		const responseData = res.data as WalletExportVerifyResponse;
		if (responseData?.success !== true) {
			throw new Error(
				`Failed to verify OTP: ${JSON.stringify(responseData)}`,
			);
		}
		return responseData;
	} catch (err) {
		throw new Error(`verifyWalletExportOTP error: ${(err as Error).message}`);
	}
}

export async function getOnrampLink(address: string): Promise<string> {
	const baseUrl = 'https://app.rampnetwork.com/exchange';
	const params = new URLSearchParams();
	params.append('defaultFlow', 'ONRAMP');
	params.append('enabledFlows', 'ONRAMP');
	params.append('enabledCryptoAssets', 'STARKNET_*');
	params.append('hostApiKey', 'p8skgorascdvryjzeqoah3xxfbpnx79nopzo6pzw');
	params.append('userAddress', address);
	params.append('outAsset', 'STARKNET_USDC');
	params.append('inAsset', 'USD');
	params.append('inAssetValue', '10000');
	return `${baseUrl}?${params.toString()}`;
}