import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export { withAuth } from "next-auth/middleware";

export async function middleware(request: NextRequest) {
	const url = request.nextUrl.clone();
	const token = await getToken({ req: request });

	if (!token && url.pathname !== "/") {
		url.pathname = "/";
		return NextResponse.redirect(url);
	}

	if (token && url.pathname === "/") {
		url.pathname = "/marketplace";
		return NextResponse.redirect(url);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
