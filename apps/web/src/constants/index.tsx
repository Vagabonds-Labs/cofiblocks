import { constants, RpcProvider, shortString } from "starknet";

// Network and Chain Configuration
export const CHAIN_ID =
	process.env.NEXT_PUBLIC_CHAIN_ID === constants.NetworkName.SN_MAIN
		? constants.NetworkName.SN_MAIN
		: constants.NetworkName.SN_SEPOLIA;

const NODE_URL =
	process.env.NEXT_PUBLIC_CHAIN_ID === constants.NetworkName.SN_MAIN
		? "https://starknet-mainnet.public.blastapi.io"
		: "https://starknet-sepolia.public.blastapi.io";

const STARKNET_CHAIN_ID =
	process.env.NEXT_PUBLIC_CHAIN_ID === constants.NetworkName.SN_MAIN
		? constants.StarknetChainId.SN_MAIN
		: constants.StarknetChainId.SN_SEPOLIA;

export const provider = new RpcProvider({
	nodeUrl: NODE_URL,
	chainId: STARKNET_CHAIN_ID,
});

// Token Addresses
export const ETHTokenAddress =
	"0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

export const DAITokenAddress =
	"0x00da114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3";

// Argent Related Constants
export const ARGENT_DUMMY_CONTRACT_ADDRESS =
	"0x001c515f991f706039696a54f6f33730e9b0e8cc5d04187b13c2c714401acfd4";

export const ARGENT_SESSION_SERVICE_BASE_URL =
	process.env.NEXT_PUBLIC_ARGENT_SESSION_SERVICE_BASE_URL ??
	"https://cloud.argent-api.com/v1";

export const ARGENT_WEBWALLET_URL =
	process.env.NEXT_PUBLIC_ARGENT_WEBWALLET_URL ?? "https://web.argent.xyz";

// Application Specific Constants
export const SIGNER = "0x123";
export const DOMAIN_NAME = "CofiBlocks";
export const WELCOME_MESSAGE = `Welcome to ${DOMAIN_NAME}!`;
export const MESSAGE = {
	message: {
		message: WELCOME_MESSAGE,
	},
	types: {
		StarkNetDomain: [
			{ name: "name", type: "felt" },
			{ name: "version", type: "felt" },
			{ name: "chainId", type: "felt" },
		],
		Message: [{ name: "message", type: "felt" }],
	},
	primaryType: "Message",
	domain: {
		name: "CofiBlocks",
		version: "1",
		chainId: shortString.encodeShortString(CHAIN_ID),
	},
};
