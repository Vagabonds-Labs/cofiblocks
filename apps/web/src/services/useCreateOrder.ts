import { api } from "~/trpc/react";

export function useCreateOrder() {
	return api.order.createOrder.useMutation();
}
