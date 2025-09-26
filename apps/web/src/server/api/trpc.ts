/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import type { Role } from "@prisma/client";
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
	// Get Next Auth session
	const session = await getServerAuthSession();

	// Check for Cavos Auth token in headers
	const authHeader = opts.headers.get("authorization");
	const cavosToken = authHeader?.startsWith("Bearer ")
		? authHeader.substring(7)
		: null;

	// Extract userId from headers if available (sent by client for Cavos Auth)
	const cavosUserId = opts.headers.get("x-user-id");

	return {
		db,
		session,
		cavosToken,
		cavosUserId,
		...opts,
	};
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
	transformer: superjson,
	errorFormatter({ shape, error }) {
		return {
			...shape,
			data: {
				...shape.data,
				zodError:
					error.cause instanceof ZodError ? error.cause.flatten() : null,
			},
		};
	},
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
	const start = Date.now();

	if (t._config.isDev) {
		// artificial delay in dev
		const waitMs = Math.floor(Math.random() * 400) + 100;
		await new Promise((resolve) => setTimeout(resolve, waitMs));
	}

	const result = await next();

	const end = Date.now();
	console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

	return result;
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
	.use(timingMiddleware)
	.use(({ ctx, next }) => {
		// Check for Next Auth session
		const hasNextAuthSession = !!ctx.session?.user;

		// Check for Cavos Auth
		const hasCavosAuth = !!ctx.cavosToken && !!ctx.cavosUserId;

		// Allow access if either auth method is valid
		if (!hasNextAuthSession && !hasCavosAuth) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}

		// If using Next Auth, keep the session as is
		if (hasNextAuthSession) {
			return next({
				ctx: {
					session: { ...ctx.session, user: ctx.session.user },
				},
			});
		}

		// If using Cavos Auth, create a compatible session object
		return next({
			ctx: {
				session: {
					user: {
						id: ctx.cavosUserId as string,
						// Default role for Cavos users
						role: "COFFEE_BUYER",
					},
				},
			},
		});
	});

/**
 * Role-based middleware
 *
 * Enforces that the user has one of the allowed roles to access the procedure.
 */
const enforceUserRole = (allowedRoles: Role[]) => {
	return t.middleware(async ({ ctx, next }) => {
		if (!ctx.session || !ctx.session.user) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}

		const user = await ctx.db.user.findUnique({
			where: { id: ctx.session.user.id },
		});

		if (!user || !allowedRoles.includes(user.role)) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "You don't have permission to perform this action",
			});
		}

		return next({
			ctx: {
				...ctx,
				// Add the full user object to the context
				user,
			},
		});
	});
};

/**
 * Producer-only procedure
 *
 * Only allows COFFEE_PRODUCER role to access these procedures
 */
export const producerProcedure = protectedProcedure.use(
	enforceUserRole(["COFFEE_PRODUCER"]),
);

/**
 * Buyer-only procedure
 *
 * Only allows COFFEE_BUYER role to access these procedures
 */
export const buyerProcedure = protectedProcedure.use(
	enforceUserRole(["COFFEE_BUYER"]),
);

/**
 * Admin-only procedure
 *
 * Only allows ADMIN role to access these procedures
 */
export const adminProcedure = protectedProcedure.use(
	enforceUserRole(["ADMIN"]),
);
