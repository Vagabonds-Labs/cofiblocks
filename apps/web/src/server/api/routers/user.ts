import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
	getUser: publicProcedure
		.input(z.object({ userId: z.string() }))
		.query(({ ctx, input }) => {
			return ctx.db.user.findUnique({
				where: { id: input.userId },
			});
		}),

	updateUserProfile: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				name: z.string().optional().optional(),
				email: z.string().email().optional(),
				physicalAddress: z.string().optional(),
				image: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { userId, ...updateData } = input;
			return ctx.db.user.update({
				where: { id: userId },
				data: updateData,
			});
		}),
});
