import type { OrderStatus } from "@prisma/client";
import { z } from "zod";
import type { WalletResponse as SDKWalletResponse } from "@chipi-pay/chipi-sdk";

export type Badge = "lover" | "contributor" | "producer";

export type UserProfileType = {
	name: string;
	country: string;
	memberSince: number;
	thumbnailUrl: string;
	badges: Badge[];
};

export type EditProfileOption = {
	imgUrl: string;
	labelKey: string;
	href: string;
	customClass?: string;
	iconColor?: string;
};

export enum RoastLevel {
	LIGHT = "light",
	MEDIUM = "medium",
	STRONG = "strong",
}

export type SaleDetailsType = {
	productName: string;
	status: OrderStatus;
	roast: string;
	type: string;
	quantity: string;
	delivery: string;
	totalPrice: string;
	address?: string;
};

export enum SalesStatus {
	Paid = "Paid",
	Prepared = "Prepared",
	Shipped = "Shipped",
	Delivered = "Delivered",
}

export type OrderDetailsType = {
	productName: string;
	status: string;
	roast: string;
	type: string;
	quantity: string;
	delivery: string;
	totalPrice: string;
	address?: string;
};

export enum DeliveryMethod {
	Address = "Address",
	Meetup = "Meetup",
}

export const filtersSchema = z.object({
	statusPending: z.boolean().optional(),
	statusCompleted: z.boolean().optional(),
	statusCancelled: z.boolean().optional(),
});

export type FormValues = z.infer<typeof filtersSchema>;

export interface OrderItem {
	id: string;
	productName: string;
	status: OrderStatus;
	sellerName?: string;
	buyerName?: string;
	delivery?: DeliveryMethod;
}

export interface Order {
	date: string;
	items: OrderItem[];
}

// Chipi SDK types
export interface WalletData {
	encryptedPrivateKey: string;
	txHash?: string;
	publicKey?: string;
	address?: string;
	activate?: () => Promise<{ txHash: string }>;
}

export interface UnsafeMetadata {
	wallet: WalletData;
	[key: string]: unknown;
}

export interface WalletResponse extends SDKWalletResponse {
	wallet: {
		encryptedPrivateKey: string;
		publicKey?: string;
		address?: string;
		activate?: () => Promise<{ txHash: string }>;
	};
}

export interface SessionClaims {
	publicMetadata: Record<string, unknown>;
	unsafeMetadata: UnsafeMetadata;
}

export interface CreateWalletResponse {
	accountAddress: string;
	txHash: string;
}

declare module "@chipi-pay/chipi-sdk" {
	export interface WalletResponse {
		success: boolean;
		txHash: string;
		accountAddress: string;
		wallet: {
			encryptedPrivateKey: string;
			publicKey?: string;
			address?: string;
			activate?: () => Promise<{ txHash: string }>;
		};
		checkTransactionStatus: () => Promise<{
			confirmed: boolean;
			publicKey?: string;
			address?: string;
		}>;
	}

	export interface UseCreateWalletResult {
		createWalletAsync: (pin: string) => Promise<WalletResponse>;
		createWalletResponse: WalletResponse | null;
		isLoading: boolean;
		isError: boolean;
	}

	export function useCreateWallet(): UseCreateWalletResult;
}
