import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { registerUser } from "~/server/services/cavos";
import {
	getclaimBalanceCoffeeLover,
	getclaimBalanceProducer,
	getclaimBalanceRoaster,
} from "~/server/contracts/distribution";

export const distributionRouter = createTRPCRouter({
	// Get user's favorites
	getclaimBalanceProducer: protectedProcedure.query(async ({ ctx }) => {
		if (!ctx.session.user) {
			throw new Error("User not authenticated");
		}
		if (!ctx.session.user.email) {
			throw new Error("User email not found");
		}
		const userAuthData = await registerUser(ctx.session.user.email, "1234");
		return await getclaimBalanceProducer(userAuthData);
	}),

	getclaimBalanceCoffeeLover: protectedProcedure.query(async ({ ctx }) => {
		if (!ctx.session.user) {
			throw new Error("User not authenticated");
		}
		if (!ctx.session.user.email) {
			throw new Error("User email not found");
		}
		const userAuthData = await registerUser(ctx.session.user.email, "1234");
		return await getclaimBalanceCoffeeLover(userAuthData);
	}),

	getclaimBalanceRoaster: protectedProcedure.query(async ({ ctx }) => {
		if (!ctx.session.user) {
			throw new Error("User not authenticated");
		}
		if (!ctx.session.user.email) {
			throw new Error("User email not found");
		}
		const userAuthData = await registerUser(ctx.session.user.email, "1234");
		return await getclaimBalanceRoaster(userAuthData);
	}),
});
