import z from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { registerUser } from "~/server/services/cavos";
import { balanceOf } from "~/server/contracts/cofi_collection";

export const cofiCollectionRouter = createTRPCRouter({
	// Get user's favorites
	getBalanceOf: protectedProcedure
		.input(z.object({ tokenId: z.string() }))
		.query(async ({ ctx, input }) => {
			if (!ctx.session.user.email) {
				throw new Error("User email not found");
			}
			const userAuthData = await registerUser(ctx.session.user.email, "1234");
			return await balanceOf(userAuthData, BigInt(input.tokenId));
		}),
});
