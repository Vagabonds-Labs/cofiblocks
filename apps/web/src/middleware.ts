import type { Role } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes and their allowed roles
const protectedRoutes: Record<string, Role[]> = {
	"/user/register-coffee": ["COFFEE_PRODUCER"],
	"/user/my-coffee": ["COFFEE_PRODUCER"],
	"/user/my-sales": ["COFFEE_PRODUCER"],
} as const;

export async function middleware(request: NextRequest) {
	const pathname = request.nextUrl.pathname;
	const token = await getToken({ req: request });

	// Check if the path is protected
	const allowedRoles = protectedRoutes[pathname];

	if (allowedRoles) {
		if (!token) {
			// Redirect to login if not authenticated
			return NextResponse.redirect(new URL("/", request.url));
		}

		// eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
		const userRole = token?.role as Role;

		if (!userRole || !allowedRoles.includes(userRole)) {
			// Redirect to marketplace if not authorized
			return NextResponse.redirect(new URL("/marketplace", request.url));
		}
	}

	// Handle default redirect for authenticated users
	if (token && pathname === "/") {
		return NextResponse.redirect(new URL("/marketplace", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
		"/user/register-coffee",
		"/user/my-coffee",
		"/user/my-sales",
	],
};
