import { z } from "zod";
import { createTRPCRouter, producerProcedure } from "../trpc";

export const producerRouter = createTRPCRouter({
	registerCoffee: producerProcedure
		.input(
			z.object({
				variety: z.string(),
				description: z.string(),
				roast: z.string(),
				price: z.number(),
				bagsAvailable: z.number(),
				image: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Implementation for registering coffee
			return ctx.db.product.create({
				data: {
					name: input.variety,
					price: input.price,
					tokenId: Math.floor(Math.random() * 1000000), // This should be handled properly in production
					nftMetadata: {
						description: input.description,
						roast: input.roast,
						bagsAvailable: input.bagsAvailable,
						image: input.image,
					},
				},
			});
		}),

	getMySales: producerProcedure.query(async ({ ctx }) => {
		return ctx.db.order.findMany({
			where: {
				items: {
					some: {
						product: {
							tokenId: {
								gt: 0,
							},
						},
					},
				},
			},
			include: {
				items: {
					include: {
						product: true,
					},
				},
				user: true,
			},
		});
	}),

	getMyCoffee: producerProcedure.query(async ({ ctx }) => {
		return ctx.db.product.findMany({
			where: {
				tokenId: {
					gt: 0,
				},
			},
		});
	}),
});
