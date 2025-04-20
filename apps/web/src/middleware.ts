import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Removed unused publicPaths variable
/*
const publicPaths = [
	"/",
	"/marketplace",
	"/product/(.*)",
	"/auth/(.*)",
	"/api/(.*)",
	"/onboarding",
	"/clerk-demo",
];
*/

// Removed unused function isPublicRoute
/*
function isPublicRoute(path: string): boolean {
	return publicPaths.some((publicPath) => {
		if (publicPath.endsWith("(.*)")) {
			const basePath = publicPath.replace("(.*)", "");
			return path.startsWith(basePath);
		}
		return path === publicPath;
	});
}
*/

// This is a simpler middleware approach for initial testing
// Once you confirm Clerk is working, you can add more complex logic
export function middleware(_request: NextRequest) {
	// Simply pass through all requests for now
	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
