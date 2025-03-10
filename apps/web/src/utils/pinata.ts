"server only";

import axios from "axios";
import { PinataSDK } from "pinata-web3";

export const pinata = new PinataSDK({
	pinataJwt: `${process.env.PINATA_JWT}`,
	pinataGateway: `${process.env.NEXT_PUBLIC_GATEWAY_URL}`,
});

// To get the client side form implementation of file uploads to pinata:
// Visit the url: https://docs.pinata.cloud/frameworks/next-js-ipfs#create-client-side-form

// If file size limitation is crossed consistently and there is need to upload more than the limit
// then this implementation can be changed to follow the guide:
// https://www.pinata.cloud/blog/how-to-upload-to-ipfs-from-the-frontend-with-signed-jwts/

const PINATA_API_URL = "https://api.pinata.cloud";

interface PinataResponse {
	IpfsHash: string;
	PinSize: number;
	Timestamp: string;
}

/**
 * Uploads an image to IPFS via Pinata
 * @param file - The file to upload
 * @returns The IPFS hash of the uploaded file
 */
export async function uploadToPinata(file: File): Promise<string> {
	try {
		const formData = new FormData();
		formData.append("file", file);

		const response = await axios.post<PinataResponse>(
			`${PINATA_API_URL}/pinning/pinFileToIPFS`,
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
					Authorization: `Bearer ${process.env.PINATA_JWT}`,
				},
			},
		);

		return response.data.IpfsHash;
	} catch (error) {
		console.error("Error uploading to Pinata:", error);
		throw new Error("Failed to upload image to IPFS");
	}
}

/**
 * Gets the IPFS URL for a given hash
 * @param hash - The IPFS hash
 * @returns The full IPFS gateway URL
 */
export function getIpfsUrl(hash: string): string {
	return `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${hash}`;
}

/**
 * Validates if a file is an image and within size limits
 * @param file - The file to validate
 * @returns boolean indicating if the file is valid
 */
export function validateImage(file: File): boolean {
	const MAX_SIZE = 10 * 1024 * 1024; // 10MB
	const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif"];

	return file.size <= MAX_SIZE && ALLOWED_TYPES.includes(file.type);
}
