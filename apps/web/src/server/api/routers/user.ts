import { z } from "zod";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";
import { registerUser } from "~/services/cavos";

export const userRouter = createTRPCRouter({
	getMe: protectedProcedure.query(async ({ ctx }) => {
		console.log("Getting user data for ID:", ctx.session.user.id);
		const user = await ctx.db.user.findUnique({
			where: { id: ctx.session.user.id },
		});

		if (!user) {
			console.error("User not found for ID:", ctx.session.user.id);
			throw new Error("User not found");
		}

		console.log("Found user:", { id: user.id, role: user.role });
		return user;
	}),

	getUser: publicProcedure
		.input(z.object({ userId: z.string() }))
		.query(({ ctx, input }) => {
			return ctx.db.user.findUnique({
				where: { id: input.userId },
			});
		}),

	checkRole: protectedProcedure.query(async ({ ctx }) => {
		const user = await ctx.db.user.findUnique({
			where: { id: ctx.session.user.id },
			select: { role: true },
		});

		if (!user) {
			throw new Error("User not found");
		}

		return { role: user.role };
	}),

	updateUserProfile: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				name: z.string().optional(),
				email: z.string().email().optional(),
				physicalAddress: z.string().optional(),
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

	updateWalletAddress: protectedProcedure
		.input(
			z.object({
				walletAddress: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { walletAddress } = input;
			const userId = ctx.session.user.id;

			// Check if wallet address is already in use
			const existingUser = await ctx.db.user.findUnique({
				where: { walletAddress },
			});

			if (existingUser && existingUser.id !== userId) {
				throw new Error("Wallet address already in use");
			}

			// Update user's wallet address
			return ctx.db.user.update({
				where: { id: userId },
				data: { walletAddress },
			});
		}),

	getUserAddress: protectedProcedure
		.query(async ({ ctx }) => {
			if (!ctx.session.user.email) {
				throw new Error("User email not found");
			}
			const userAuthData = await registerUser(ctx.session.user.email, "1234");
			return userAuthData.wallet_address;
		}),
});
