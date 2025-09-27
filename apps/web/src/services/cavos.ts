import axios, { AxiosResponse } from 'axios';

const CAVOS_API_BASE = 'https://services.cavos.xyz/api/v1/external';

export interface UserAuthData {
  user_id: string;
  email: string;
  wallet_address: string;
  wallet_public_key: string;
  wallet_private_key: string;
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
  'Content-Type': 'application/json',
});

const NETWORK = process.env.CAVOS_NETWORK!;
const ORG_ID = process.env.CAVOS_ORG_ID!;
const API_SECRET = process.env.CAVOS_API_SECRET!;

export async function registerUser(email: string, password: string): Promise<UserAuthData> {
  const payload = { email: email, password: password, network: NETWORK };
  const headers = getHeaders(API_SECRET);

  try {
    const res = await axios.post(
      `${CAVOS_API_BASE}/auth/register`, payload, { headers, validateStatus: () => true }
    );
    if (res.data.success !== true) {
      if (res.data.message?.includes("already registered")) {
        console.log("User already registered, authenticating...");
        return await authenticateUser(email, password);
      }
      throw new Error(`Registration failed: ${JSON.stringify(res.data)}`);
    }

    return {
      user_id: res.data.data.user_id,
      email: res.data.data.email,
      wallet_public_key: res.data.data.wallet.public_key,
      wallet_private_key: res.data.data.wallet.private_key,
      wallet_address: res.data.data.wallet.address,
      access_token: res.data.data.authData.accessToken,
      refresh_token: res.data.data.authData.refreshToken,
      expires_in: res.data.data.authData.expiresIn,
      timestamp: res.data.data.authData.timestamp,
    };
  } catch (err) {
    throw new Error(`registerUser error: ${(err as Error).message}`);
  }
}

export async function authenticateUser(email: string, password: string): Promise<UserAuthData> {
  const payload = { email, password, network: NETWORK };
  const headers = getHeaders(API_SECRET);

  try {
    const res = await axios.post(
      `${CAVOS_API_BASE}/auth/login`, payload, { headers, validateStatus: () => true }
    );
    if (res.data.success !== true) {
      throw new Error(`Authentication failed: ${JSON.stringify(res.data)}`);
    }

    const auth = res.data.data.authData;

    return {
      user_id: res.data.data.user_id,
      email: res.data.data.email,
      wallet_address: res.data.data.wallet.address,
      wallet_public_key: res.data.data.wallet.public_key,
      wallet_private_key: res.data.data.wallet.private_key,
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
  transaction: TransactionDetails
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
    const res = await axios.post(
      `${CAVOS_API_BASE}/execute/session`, payload, { headers, validateStatus: () => true }
    );
    if (res.data.success !== true) {
      throw new Error(`Transaction execution failed: ${JSON.stringify(res.data)}`);
    }
    return res.data.result.result.transactionHash;
  } catch (err) {
    console.log(err);
    throw new Error(`executeTransaction error: ${(err as Error).message}`);
  }
}
