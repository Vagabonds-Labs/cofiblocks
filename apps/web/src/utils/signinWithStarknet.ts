import { Account, type Signature } from "starknet";
import { type TypedData, shortString } from "starknet";
import type { WeierstrassSignatureType } from "starknet";
import {
	CHAIN_ID,
	DOMAIN_NAME,
	SIGNER,
	WELCOME_MESSAGE,
	provider,
} from "~/constants";

export const createMessageStructure = (message: string): TypedData => ({
	domain: {
		chainId: shortString.encodeShortString(CHAIN_ID),
		name: shortString.encodeShortString(DOMAIN_NAME),
		version: "1",
	},
	message: {
		message: shortString.encodeShortString(message),
	},
	primaryType: "Message",
	types: {
		Message: [{ name: "message", type: "felt" }],
		StarkNetDomain: [
			{ name: "name", type: "felt" },
			{ name: "version", type: "felt" },
			{ name: "chainId", type: "felt" },
		],
	},
});

export const parseSignatureString = (
	signatureString: string,
): WeierstrassSignatureType => {
	try {
		const sig = signatureString.split(",");
		return {
			r: BigInt(sig[1] ?? 0),
			s: BigInt(sig[2] ?? 0),
		} as WeierstrassSignatureType;
	} catch (error) {
		console.error(
			"Error parsing signature:",
			error instanceof Error ? error.message : String(error),
		);
		throw new Error("Failed to parse signature");
	}
};

export const signMessage = async (address: string): Promise<Signature> => {
	const account = new Account(provider, address, SIGNER);
	const messageStructure = createMessageStructure(WELCOME_MESSAGE);
	const signature = await account.signMessage(messageStructure);

	if (!signature) {
		throw new Error("Failed to sign message");
	}

	return signature;
};

export const validateCredentials = (
	signature: string | undefined,
	address: string | undefined,
) => {
	if (!address || !signature) {
		throw new Error("Missing address or signature");
	}
};

export const verifySignature = async (
	address: string,
	message: TypedData,
	signature: Signature,
): Promise<boolean> => {
	try {
		const account = new Account(provider, address, SIGNER);
		const isValid = await account.verifyMessage(message, signature);

		return isValid;
	} catch (error) {
		console.error("Error verifying signature:", error);
		return false;
	}
};

export const verifyUserSignature = async (
	address: string,
	signature: string,
) => {
	const typedData = createMessageStructure("Welcome to CofiBlocks!");
	const parsedSignature = parseSignatureString(signature);
	const isValid = await verifySignature(address, typedData, parsedSignature);

	if (!isValid) {
		throw new Error("Invalid signature");
	}
};
