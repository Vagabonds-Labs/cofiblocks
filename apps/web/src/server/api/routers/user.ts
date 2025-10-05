import type { Role } from "@prisma/client";
import { hash } from "bcrypt";
import { z } from "zod";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";
import { CofiBlocksContracts, getCallToContract, getContractAddress } from "~/utils/contracts";
import { authenticateUser, executeTransaction } from "~/server/services/cavos";
import { TRPCError } from "@trpc/server";
import { format_number } from "~/utils/formatting";

export const userRouter = createTRPCRouter({
	getUser: publicProcedure
		.input(z.object({ userId: z.string() }))
		.query(({ ctx, input }) => {
			return ctx.db.user.findUnique({
				where: { id: input.userId },
			});
		}),

	getUserBalances: publicProcedure
		.input(z.object({ userId: z.string() }))
		.query(async ({ ctx, input }) => {
			const user = await ctx.db.user.findUnique({
				where: { id: input.userId },
			});
			const calldata = [user?.walletAddress || "0x0"];

			const stark_balance_result = await getCallToContract(
				CofiBlocksContracts.STRK,
				"balance_of",
				calldata,
			);
			const stark_balance = Number(stark_balance_result) / 10 ** 18;

			const usdt_balance_result = await getCallToContract(
				CofiBlocksContracts.USDT,
				"balance_of",
				calldata,
			);
			const usdt_balance = Number(usdt_balance_result) / 10 ** 6;

			const usdc_balance_result = await getCallToContract(
				CofiBlocksContracts.USDC,
				"balance_of",
				calldata,
			);
			const usdc_balance = Number(usdc_balance_result) / 10 ** 6;

			let claim_endpoint = "coffee_lover_claim_balance";
			if (user?.role === "COFFEE_PRODUCER") {
				claim_endpoint = "producer_claim_balance";
			}

			const claim_balance_result = await getCallToContract(
				CofiBlocksContracts.DISTRIBUTION,
				claim_endpoint,
				calldata,
			);
			const claim_balance = Number(claim_balance_result) / 10 ** 6;

			return {
				claimBalance: Number(claim_balance),
				starkBalance: Number(stark_balance),
				usdtBalance: Number(usdt_balance),
				usdcBalance: Number(usdc_balance),
			};
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

	getUserAddress: protectedProcedure.query(async ({ ctx }) => {
		if (!ctx.session.user.email) {
			throw new Error("User email not found");
		}
		return crypto.randomUUID();
	}),

	isUserVerified: publicProcedure
		.input(z.object({ email: z.string() }))
		.query(async ({ ctx, input }) => {
			const user = await ctx.db.user.findUnique({ where: { email: input.email } });
			return user?.emailVerified !== null;
		}),

	withdrawToken: protectedProcedure
		.input(z.object({ token: z.enum(["STRK", "USDC", "USDT"]), recipient: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session.user || !ctx.session.user.email) {
				throw new TRPCError({ code: "UNAUTHORIZED", message: "User not found" });
			}

			const cavosUser = await ctx.db.userCavos.findUnique({
				where: { email: ctx.session.user.email, network: process.env.CAVOS_NETWORK },
			});
			if (!cavosUser) {
				throw new TRPCError({ code: "UNAUTHORIZED", message: "User Cavos not found" });
			}
			const userAuthData = await authenticateUser(cavosUser.email, cavosUser.password);

			// Check current balance
			const balance_result = await getCallToContract(
				CofiBlocksContracts[input.token],
				"balance_of",
				[cavosUser.walletAddress],
			);
			const balance = Number(balance_result);
			if (balance === 0) {
				throw new TRPCError({ code: "BAD_REQUEST", message: "No balance to withdraw" });
			}

			const formattedBalance = format_number(BigInt(balance));
			const transaction = {
				contract_address: getContractAddress(CofiBlocksContracts[input.token]),
				entrypoint: "transfer",
				calldata: [input.recipient, formattedBalance.high, formattedBalance.low],
			};
			const tx = await executeTransaction(userAuthData, transaction)
			return tx;
		}),
});
