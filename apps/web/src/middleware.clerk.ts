import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { SessionClaims, UnsafeMetadata } from "~/types";

// Keep these routes public
const publicPaths = [
	"/",
	"/product/(.*)",
	"/api/(.*)",
	"/api/trpc/(.*)",  // Make tRPC endpoints public
	"/sign-in",
	"/sign-up",
	"/clerk-demo",
	"/onboarding",
	"/marketplace", // Make marketplace public by default
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

// Helper function to check if user has a wallet
function hasWallet(sessionClaims: unknown): boolean {
	try {
		const claims = sessionClaims as SessionClaims;
		const metadata = claims?.unsafeMetadata as UnsafeMetadata | undefined;
		console.log('[middleware] Checking wallet status:', {
			hasMetadata: !!metadata,
			hasWallet: !!metadata?.wallet,
			walletCreated: metadata?.walletCreated,
			walletAddress: metadata?.wallet?.address,
			fullMetadata: metadata
		});
		// Check for either wallet data or walletCreated flag
		return !!(metadata?.wallet || metadata?.walletCreated);
	} catch (error) {
		console.error("[middleware] Error checking wallet:", error);
		return false;
	}
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
	const { userId, sessionClaims } = await auth();
	const path = req.nextUrl.pathname;
	const url = req.url;

	console.log("=== Middleware Check ===");
	console.log("Path:", path);
	console.log("User ID:", userId);
	console.log("Full session claims:", JSON.stringify(sessionClaims, null, 2));

	// If not authenticated, allow access to public routes only
	if (!userId) {
		if (isPublicRoute(path)) {
			return NextResponse.next();
		}
		const signInUrl = new URL("/sign-in", url);
		signInUrl.searchParams.set("redirect_url", url);
		return NextResponse.redirect(signInUrl);
	}

	// For authenticated users, check wallet status
	const userHasWallet = hasWallet(sessionClaims);
	console.log('[middleware] User has wallet:', userHasWallet);

	// If user has no wallet and is not on onboarding page, redirect to onboarding
	if (!userHasWallet && path !== "/onboarding") {
		console.log("[middleware] No wallet found, redirecting to onboarding");
		return NextResponse.redirect(new URL("/onboarding", url));
	}

	// If user has a wallet and tries to access onboarding, redirect to marketplace
	if (userHasWallet && path === "/onboarding") {
		console.log("[middleware] Wallet exists, redirecting to marketplace");
		return NextResponse.redirect(new URL("/marketplace", url));
	}

	// If user is on auth pages and is authenticated, redirect to marketplace
	if (path === "/sign-in" || path === "/sign-up") {
		console.log("[middleware] Redirecting authenticated user to marketplace");
		return NextResponse.redirect(new URL("/marketplace", url));
	}

	return NextResponse.next();
});

export const config = {
	matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
