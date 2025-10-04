import crypto from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import axios, { AxiosResponse } from "axios";
import { generateSecurePassword } from "~/utils/passwordValidation";

const CAVOS_API_BASE = "https://services.cavos.xyz/api/v1/external";

export interface UserAuthData {
	user_id: string;
	email: string;
	wallet_address: string;
	wallet_public_key: string;
	access_token: string;
	refresh_token: string;
	expires_in: number;
	timestamp: number;
}

export interface TransactionDetails {
	contract_address: string;
	entrypoint: string;
	calldata: string[];
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
		"Missing required environment variables: CAVOS_NETWORK, CAVOS_ORG_ID, CAVOS_ORG_SECRET",
	);
}

export async function registerUserCavos(
	email: string,
	db: PrismaClient,
): Promise<UserAuthData> {
	// Check if user already exists in our database and authenticate them
	const existingUser = await db.userCavos.findUnique({
		where: { email: email, network: process.env.CAVOS_NETWORK },
	});
	if (existingUser) {
		const existingUserAuthData = await authenticateUser(
			email,
			existingUser.password,
		);
		await db.userCavos.update({
			where: { email: email, network: process.env.CAVOS_NETWORK },
			data: {
				accessToken: existingUserAuthData.access_token,
				accessExpiration: new Date(
					existingUserAuthData.expires_in * 1000 +
						existingUserAuthData.timestamp,
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
		userAuthData.expires_in * 1000 + userAuthData.timestamp,
	);

	// Create or update user with Cavos User data
	await db.userCavos.upsert({
		where: { email: email, network: process.env.CAVOS_NETWORK },
		update: {
			accessToken: userAuthData.access_token,
			accessExpiration: accessExpiration,
			refreshToken: userAuthData.refresh_token,
		},
		create: {
			email: email,
			walletAddress: userAuthData.wallet_address,
			password: randomPassword,
			network: process.env.CAVOS_NETWORK,
			accessToken: userAuthData.access_token,
			accessExpiration: accessExpiration,
			refreshToken: userAuthData.refresh_token,
		},
	});

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
		if (res.data.success !== true) {
			throw new Error(`Registration failed: ${JSON.stringify(res.data)}`);
		}

		return {
			user_id: res.data.data.user_id,
			email: res.data.data.email,
			wallet_public_key: res.data.data.wallet.data.public_key,
			wallet_address: res.data.data.wallet.data.address,
			access_token: res.data.data.authData.accessToken,
			refresh_token: res.data.data.authData.refreshToken,
			expires_in: res.data.data.authData.expiresIn,
			timestamp: res.data.data.authData.timestamp,
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
		if (res.data.success !== true) {
			throw new Error(`Authentication failed: ${JSON.stringify(res.data)}`);
		}

		const auth = res.data.data.authData;

		return {
			user_id: res.data.data.user_id,
			email: res.data.data.email,
			wallet_address: res.data.data.wallet.address,
			wallet_public_key: res.data.data.wallet.public_key,
			access_token: auth.accessToken,
			refresh_token: auth.refreshToken,
			expires_in: auth.expiresIn,
			timestamp: auth.timestamp,
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
		if (res.data.success !== true) {
			throw new Error(
				`Transaction execution failed: ${JSON.stringify(res.data)}`,
			);
		}
		return res.data.result.result.transactionHash;
	} catch (err) {
		console.log(err);
		throw new Error(`executeTransaction error: ${(err as Error).message}`);
	}
}
