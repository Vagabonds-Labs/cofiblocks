import { z } from "zod";

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
	status: string;
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
	statusPaid: z.boolean().optional(),
	statusPrepared: z.boolean().optional(),
	statusShipped: z.boolean().optional(),
	statusDelivered: z.boolean().optional(),
	deliveryAddress: z.boolean().optional(),
	deliveryMeetup: z.boolean().optional(),
});

export type FormValues = z.infer<typeof filtersSchema>;

export interface OrderItem {
	id: string;
	productName: string;
	status: SalesStatus;
	sellerName?: string;
	buyerName?: string;
	delivery?: DeliveryMethod;
}

export interface Order {
	date: string;
	items: OrderItem[];
}
