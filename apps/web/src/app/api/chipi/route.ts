import type { NextRequest } from "next/server";

const CHIPI_SECRET_KEY = process.env.CHIPI_SECRET_KEY;
const CHIPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_CHIPI_PUBLIC_KEY;
const CHIPI_APP_ID = process.env.NEXT_PUBLIC_CHIPI_APP_ID;

if (!CHIPI_SECRET_KEY || !CHIPI_PUBLIC_KEY || !CHIPI_APP_ID) {
	throw new Error("Missing Chipi configuration");
}

interface ChipiRequest {
	operation: string;
	data: unknown;
}

export async function POST(request: NextRequest) {
	const { operation, data } = (await request.json()) as ChipiRequest;

	// Handle different operations that require the secret key
	switch (operation) {
		// Add operations as needed
		default:
			return Response.json({ error: "Invalid operation" }, { status: 400 });
	}
} 