import { api } from "~/trpc/react";

export function useCreateOrder() {
	return api.order.createOrder.useMutation();
}

export function useCreateOrderMist() {
	return api.order.createMistOrder.useMutation();
}
