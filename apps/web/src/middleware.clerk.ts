import { authMiddleware, redirectToSignIn, type AuthObject } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";

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

export default authMiddleware({
	publicRoutes: publicPaths,

	afterAuth(auth: AuthObject, req: NextRequest) {
		const { userId, sessionClaims } = auth;
		const path = req.nextUrl.pathname;
		const url = req.url;

		const isPublic = isPublicRoute(path);

		if (userId) {
			if (
				!isPublic &&
				path !== "/onboarding" &&
				!sessionClaims?.publicMetadata?.wallet
			) {
				return NextResponse.redirect(new URL("/onboarding", url));
			}

			if (path === "/onboarding" && sessionClaims?.publicMetadata?.wallet) {
				return NextResponse.redirect(new URL("/marketplace", url));
			}

			if (path === "/sign-in" || path === "/sign-up") {
				return NextResponse.redirect(new URL("/marketplace", url));
			}
		}

		if (!userId && !isPublic) {
			return redirectToSignIn({ returnBackUrl: url });
		}

		return NextResponse.next();
	},
});

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

export const config = {
	matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
