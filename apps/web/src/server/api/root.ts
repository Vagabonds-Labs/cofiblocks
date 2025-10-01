import { authRouter } from "~/server/api/routers/auth";
import { cartRouter } from "~/server/api/routers/cart";
import { cofiCollectionRouter } from "~/server/api/routers/cofi_collection";
import { distributionRouter } from "~/server/api/routers/distribution";
import { favoritesRouter } from "~/server/api/routers/favorites";
import { marketplaceRouter } from "~/server/api/routers/marketplace";
import { orderRouter } from "~/server/api/routers/order";
import { producerRouter } from "~/server/api/routers/producer";
import { productRouter } from "~/server/api/routers/product";
import { userRouter } from "~/server/api/routers/user";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

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
	auth: authRouter,
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
