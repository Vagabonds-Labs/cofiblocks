import { clerkMiddleware, type ClerkMiddlewareAuth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";

// Define types for session claims
interface SessionClaims {
	publicMetadata?: {
		wallet?: boolean;
	};
}

// Keep these routes public
const publicPaths = [
	"/",
	"/marketplace",
	"/product/(.*)",
	"/auth/(.*)",
	"/api/(.*)",
	"/onboarding",
	"/sign-in",
	"/sign-up",
	"/clerk-demo",
];

// Helper function to check if a route is public
function isPublicRoute(path: string): boolean {
	return publicPaths.some((publicPath) => {
		if (publicPath.endsWith("(.*)")) {
			const basePath = publicPath.replace("(.*)", "");
			return path.startsWith(basePath);
		}
		return path === publicPath;
	});
}

export default clerkMiddleware(async (auth: ClerkMiddlewareAuth, req: NextRequest) => {
	const authObject = await auth();
	const { userId, sessionClaims } = authObject;
	const path = req.nextUrl.pathname;
	const url = req.url;

	const isPublic = isPublicRoute(path);

	// Handle authenticated users
	if (userId) {
		// Redirect to onboarding if user has no wallet and tries to access protected routes
		if (
			!isPublic &&
			path !== "/onboarding" &&
			!(sessionClaims as SessionClaims)?.publicMetadata?.wallet
		) {
			return NextResponse.redirect(new URL("/onboarding", url));
		}

		// Redirect to marketplace if user has wallet and tries to access onboarding
		if (path === "/onboarding" && (sessionClaims as SessionClaims)?.publicMetadata?.wallet) {
			return NextResponse.redirect(new URL("/marketplace", url));
		}

		// Redirect to marketplace if authenticated user tries to access auth pages
		if (path === "/sign-in" || path === "/sign-up") {
			return NextResponse.redirect(new URL("/marketplace", url));
		}
	}

	// Handle unauthenticated users
	if (!userId && !isPublic) {
		const signInUrl = new URL("/sign-in", url);
		signInUrl.searchParams.set("redirect_url", url);
		return NextResponse.redirect(signInUrl);
	}

	return NextResponse.next();
});

export const config = {
	matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
