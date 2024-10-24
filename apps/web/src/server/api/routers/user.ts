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

	getUserFarm: publicProcedure
		.input(z.object({ userId: z.number() }))
		.query(async ({ ctx, input }) => {
			return ctx.db.farm.findFirst({
				where: { userId: input.userId.toString() },
			});
		}),

	updateUserFarm: publicProcedure
		.input(
			z.object({
				farmId: z.number(),
				name: z.string(),
				region: z.string(),
				altitude: z.number(),
				coordinates: z.string(),
				website: z.string(),
				farmImage: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { farmId, ...updateData } = input;
			return ctx.db.farm.update({
				where: { id: farmId },
				data: updateData,
			});
		}),
});
