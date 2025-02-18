import type { Role } from "@prisma/client";
import {
	type DefaultSession,
	type NextAuthOptions,
	getServerSession,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "~/server/db";
import {
	validateCredentials,
	verifyUserSignature,
} from "~/utils/signinWithStarknet";

declare module "next-auth" {
	interface Session extends DefaultSession {
		user: {
			id: string;
			role: Role;
		} & DefaultSession["user"];
	}

	interface User {
		id: string;
		role: Role;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		role?: Role;
		userId?: string;
	}
}

const findOrCreateUser = async (walletAddress: string) => {
	let user = await db.user.findFirst({
		where: { walletAddress },
	});

	if (!user) {
		user = await db.user.create({
			data: {
				role: "COFFEE_BUYER",
				walletAddress,
			},
		});
		await db.account.create({
			data: {
				provider: "Starknet",
				providerAccountId: walletAddress,
				type: "credentials",
				userId: user.id,
			},
		});
	}

	return user;
};

const authorize = async (credentials: Record<string, string> | undefined) => {
	try {
		const signature = credentials?.signature;
		const address = credentials?.address;

		validateCredentials(signature, address);

		if (!address || !signature) {
			throw new Error("Missing address or signature");
		}

		await verifyUserSignature(address, signature);

		const user = await findOrCreateUser(address);

		return {
			id: user.id,
			role: user.role,
		};
	} catch (error) {
		console.error({ error });
		return null;
	}
};

export const authOptions: NextAuthOptions = {
	callbacks: {
		jwt: async ({ token, user }) => {
			if (user) {
				console.log("Setting JWT token with user data:", {
					userId: user.id,
					role: user.role,
				});
				token.role = user.role;
				token.userId = user.id;
			}
			return token;
		},
		session: ({ session, token }) => {
			console.log("Session callback - Token:", token);
			console.log("Session callback - Current session:", session);

			if (token) {
				session.user = {
					...session.user,
					id: token.userId ?? token.sub ?? "",
					role: token.role ?? "COFFEE_BUYER",
				};

				console.log("Updated session:", session);
			}
			return session;
		},
	},
	providers: [
		CredentialsProvider({
			name: "Starknet",
			credentials: {
				message: {
					label: "Message",
					type: "text",
					placeholder: "0x0",
				},
				signature: {
					label: "Signature",
					type: "text",
					placeholder: "0x0",
				},
				address: {
					label: "Address",
					type: "text",
					placeholder: "0x0",
				},
			},
			authorize,
		}),
	],
	pages: {
		signIn: "/",
	},
	secret: process.env.NEXTAUTH_SECRET,
	session: {
		strategy: "jwt",
		maxAge: 2592000, // 30 days
		updateAge: 86400, // 24 hours
	},
	debug: process.env.NODE_ENV === "development",
};

export const getServerAuthSession = () => getServerSession(authOptions);
