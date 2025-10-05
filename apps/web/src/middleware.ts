import type { Role } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Map of "matcher" -> allowed roles. Use regex-like strings or startsWith checks.
const protectedMatchers: Array<{
	test: (p: string) => boolean;
	roles: Role[];
}> = [
	{ test: (p) => p === "/user/register-coffee", roles: ["COFFEE_PRODUCER"] },
	{ test: (p) => p.startsWith("/user/my-coffee"), roles: ["COFFEE_PRODUCER"] },
	{ test: (p) => p.startsWith("/user/my-sales"), roles: ["COFFEE_PRODUCER"] },
	{ test: (p) => p.startsWith("/user/my-claims"), roles: ["COFFEE_PRODUCER"] },
];

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const token = await getToken({
		req: request,
		secret: process.env.NEXTAUTH_SECRET,
	});

	// If no token is found, only allow /marketplace and auth routes
	if (!token) {
		if (pathname === "/marketplace" || pathname === "/" || pathname.startsWith("/auth")) {
			return NextResponse.next();
		}
		// Redirect to marketplace for any other route when not authenticated
		return NextResponse.redirect(new URL("/marketplace", request.url));
	}

	// If token is found, check for protected routes
	const match = protectedMatchers.find((m) => m.test(pathname));
	
	// If no protected route match, allow access
	if (!match) {
		return NextResponse.next();
	}

	// For protected routes, check if user has required role
	const userRole = token.role as Role | undefined;
	if (!userRole || !match.roles.includes(userRole)) {
		return NextResponse.redirect(new URL("/marketplace", request.url));
	}

	return NextResponse.next();
}

// Keep middleware off of NextAuth APIs and static assets
export const config = {
	matcher: [
		// everything except these:
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
		// (the above already covers your /user/* paths)
	],
};
