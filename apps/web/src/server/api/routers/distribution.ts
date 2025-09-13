import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getclaimBalanceProducer, getclaimBalanceCoffeeLover, getclaimBalanceRoaster } from "~/services/contracts/distribution";
import { registerUser } from "~/services/cavos";


export const distributionRouter = createTRPCRouter({
	// Get user's favorites
	getclaimBalanceProducer: protectedProcedure
        .query(async ({ ctx }) => {
            if (!ctx.session.user.email) {
                throw new Error("User email not found");
            }
            const userAuthData = await registerUser(ctx.session.user.email, "1234");
            return await getclaimBalanceProducer(userAuthData);
        }),

    getclaimBalanceCoffeeLover: protectedProcedure
        .query(async ({ ctx }) => {
            if (!ctx.session.user.email) {
                throw new Error("User email not found");
            }
            const userAuthData = await registerUser(ctx.session.user.email, "1234");
            return await getclaimBalanceCoffeeLover(userAuthData);
        }),

    getclaimBalanceRoaster: protectedProcedure
        .query(async ({ ctx }) => {
            if (!ctx.session.user.email) {
                throw new Error("User email not found");
            }
            const userAuthData = await registerUser(ctx.session.user.email, "1234");
            return await getclaimBalanceRoaster(userAuthData);
        }),
});
