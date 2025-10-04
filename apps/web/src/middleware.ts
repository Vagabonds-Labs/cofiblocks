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

	// Public root redirect if already signed in
	const token = await getToken({
		req: request,
		secret: process.env.NEXTAUTH_SECRET,
	});

	if (token && pathname === "/") {
		return NextResponse.redirect(new URL("/marketplace", request.url));
	}

	const match = protectedMatchers.find((m) => m.test(pathname));
	if (!match) {
		return NextResponse.next();
	}

	// Require auth
	if (!token) {
		const url = new URL("/", request.url);
		// optional: add callbackUrl to return after login
		url.searchParams.set("callbackUrl", pathname);
		return NextResponse.redirect(url);
	}

	// Require role
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
