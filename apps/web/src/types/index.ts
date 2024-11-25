import { z } from "zod";

export enum SalesStatus {
	Paid = "Paid",
	Prepared = "Prepared",
	Shipped = "Shipped",
	Delivered = "Delivered",
}

export const filtersSchema = z.object({
	statusPaid: z.boolean().optional(),
	statusPrepared: z.boolean().optional(),
	statusShipped: z.boolean().optional(),
	statusDelivered: z.boolean().optional(),
});

export type FormValues = z.infer<typeof filtersSchema>;
