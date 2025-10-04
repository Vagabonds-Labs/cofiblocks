import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";
import { registerUser } from "~/server/services/cavos";
import {
	buyProduct,
	buyProducts,
	claimConsumer,
	claimProducer,
	createProduct,
	getProductPrice,
	getProductStock,
} from "~/services/contracts/marketplace";
import type { PaymentToken } from "~/utils/contracts";
import { CofiBlocksContracts, getEvents } from "~/utils/contracts";

export const marketplaceRouter = createTRPCRouter({
	// Get user's favorites
	getProductPrice: publicProcedure
		.input(
			z.object({
				tokenId: z.string(),
				tokenAmount: z.string(),
				paymentToken: z.enum(["ETH", "USDC", "USDT"]),
			}),
		)
		.query(async ({ input }) => {
			return await getProductPrice(
				BigInt(input.tokenId),
				BigInt(input.tokenAmount),
				input.paymentToken as PaymentToken,
			);
		}),

	getProductStock: publicProcedure
		.input(z.object({ tokenId: z.string() }))
		.query(async ({ input }) => {
			return await getProductStock(BigInt(input.tokenId));
		}),

	buyProduct: protectedProcedure
		.input(
			z.object({
				tokenId: z.string(),
				tokenAmount: z.string(),
				paymentToken: z.enum(["ETH", "USDC", "USDT"]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			console.log("Receive request to buy product", input.tokenId);
			// TODO need to get user pasword from db or something
			if (!ctx.session.user.email) {
				throw new Error("User email not found");
			}
			const userAuthData = await registerUser(ctx.session.user.email, "1234");
			return await buyProduct(
				BigInt(input.tokenId),
				BigInt(input.tokenAmount),
				input.paymentToken as PaymentToken,
				userAuthData,
			);
		}),

	buyProducts: protectedProcedure
		.input(
			z.object({
				tokenIds: z.array(z.string()),
				tokenAmounts: z.array(z.string()),
				paymentToken: z.enum(["ETH", "USDC", "USDT"]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			console.log("Receive request to buy products", input.tokenIds);
			// TODO need to get user pasword from db or something
			if (!ctx.session.user.email) {
				throw new Error("User email not found");
			}
			const userAuthData = await registerUser(ctx.session.user.email, "1234");
			const tokenIds_parsed = input.tokenIds.map(BigInt);
			const tokenAmounts_parsed = input.tokenAmounts.map(BigInt);
			if (tokenIds_parsed.length !== tokenAmounts_parsed.length) {
				throw new Error(
					"Token IDs and token amounts must have the same length",
				);
			}
			return await buyProducts(
				tokenIds_parsed,
				tokenAmounts_parsed,
				input.paymentToken as PaymentToken,
				userAuthData,
			);
		}),

	createProduct: protectedProcedure
		.input(z.object({ initialStock: z.string(), price_usd: z.string() }))
		.mutation(async ({ ctx, input }) => {
			console.log("Receive request to register product", input.initialStock);
			// TODO need to get user pasword from db or something
			if (!ctx.session.user.email) {
				throw new Error("User email not found");
			}
			const userAuthData = await registerUser(ctx.session.user.email, "1234");
			const tx = await createProduct(
				BigInt(input.initialStock),
				BigInt(input.price_usd),
				userAuthData,
			);
			// TODO: get token id from tx
			return { token_id: 1 };
		}),

	claimProducer: protectedProcedure.mutation(async ({ ctx }) => {
		if (!ctx.session.user.email) {
			throw new Error("User email not found");
		}
		const userAuthData = await registerUser(ctx.session.user.email, "1234");
		return await claimProducer(userAuthData);
	}),

	claimConsumer: protectedProcedure.mutation(async ({ ctx }) => {
		if (!ctx.session.user.email) {
			throw new Error("User email not found");
		}
		const userAuthData = await registerUser(ctx.session.user.email, "1234");
		return await claimConsumer(userAuthData);
	}),

	getEvents: protectedProcedure.query(async () => {
		return await getEvents(CofiBlocksContracts.MARKETPLACE);
	}),
});
