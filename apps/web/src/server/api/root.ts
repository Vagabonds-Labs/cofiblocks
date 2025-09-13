import { cartRouter } from "~/server/api/routers/cart";
import { favoritesRouter } from "~/server/api/routers/favorites";
import { orderRouter } from "~/server/api/routers/order";
import { producerRouter } from "~/server/api/routers/producer";
import { productRouter } from "~/server/api/routers/product";
import { userRouter } from "~/server/api/routers/user";
import { marketplaceRouter } from "~/server/api/routers/marketplace";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { distributionRouter } from "~/server/api/routers/distribution";
import { cofiCollectionRouter } from "~/server/api/routers/cofi_collection";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	product: productRouter,
	marketplace: marketplaceRouter,
	distribution: distributionRouter,
	cofiCollection: cofiCollectionRouter,
	user: userRouter,
	cart: cartRouter,
	favorites: favoritesRouter,
	producer: producerRouter,
	order: orderRouter,
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
