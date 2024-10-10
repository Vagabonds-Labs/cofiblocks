import { productRouter } from "~/server/api/routers/product";
import { shoppingCartRouter } from "~/server/api/routers/shoppingCart";
import { nftRouter } from "~/server/api/routers/nft";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	shoppingCart: shoppingCartRouter,
	product: productRouter,
	nft: nftRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
