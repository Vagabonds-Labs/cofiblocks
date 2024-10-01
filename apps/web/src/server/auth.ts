import crypto from "node:crypto";
import { PrismaAdapter } from "@auth/prisma-adapter";
import {
	type DefaultSession,
	type NextAuthOptions,
	getServerSession,
} from "next-auth";
import type { Session } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import {
	type JWTDecodeParams,
	type JWTEncodeParams,
	decode,
	encode,
} from "next-auth/jwt";
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
		} & DefaultSession["user"];
	}
}

const generateNonce = () => crypto.randomBytes(16).toString("hex");

export const findOrCreateUser = async (walletAddress: string) => {
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

		const nonce = generateNonce();

		const user = await findOrCreateUser(address);

		return { id: user.walletAddress, nonce };
	} catch (error) {
		console.error({ error });
		return null;
	}
};

export const authOptions: NextAuthOptions = {
	callbacks: {
		session: ({ session, token }) =>
			({
				...session,
				user: {
					...session.user,
					id: token.sub,
				},
			}) as Session & { user: { id: string } },
	},
	adapter: PrismaAdapter(db) as Adapter,
	providers: [
		CredentialsProvider({
			name: "Starknet",
			type: "credentials",
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
	jwt: {
		encode: async ({ token, secret, maxAge }: JWTEncodeParams) => {
			return encode({ token, secret, maxAge });
		},
		decode: async ({ token, secret }: JWTDecodeParams) => {
			return decode({ token, secret });
		},
	},
	session: {
		strategy: "jwt",
		maxAge: 2592000,
		updateAge: 86400,
		generateSessionToken: () => crypto.randomBytes(32).toString("hex"),
	},
};

export const getServerAuthSession = () => getServerSession(authOptions);
