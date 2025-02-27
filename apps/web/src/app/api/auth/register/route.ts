import type { Role } from "@prisma/client";
import { hash } from "bcryptjs";
import type { NextRequest } from "next/server";
import { db } from "~/server/db";

interface RegisterRequestBody {
	email: string;
	password: string;
	name: string;
}

export async function POST(req: NextRequest) {
	try {
		const body = (await req.json()) as RegisterRequestBody;
		const { email, password, name } = body;

		// Basic validation
		if (!email || !password || !name) {
			return new Response(
				JSON.stringify({ error: "Missing required fields" }),
				{ status: 400 },
			);
		}

		// Check if user already exists
		const existingUser = await db.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			return new Response(JSON.stringify({ error: "User already exists" }), {
				status: 400,
			});
		}

		// Hash password
		const hashedPassword = await hash(password, 12);

		// Create new user
		const user = await db.user.create({
			data: {
				email,
				name,
				password: hashedPassword,
				role: "COFFEE_BUYER" as Role,
				// Generate a placeholder wallet address until user connects their wallet
				walletAddress: `placeholder_${Date.now()}`,
			},
		});

		return new Response(
			JSON.stringify({
				id: user.id,
				email: user.email,
				name: user.name,
			}),
			{ status: 201 },
		);
	} catch (error) {
		console.error(
			"Registration error:",
			error instanceof Error ? error.message : "Unknown error",
		);
		return new Response(JSON.stringify({ error: "Failed to create user" }), {
			status: 500,
		});
	}
}
