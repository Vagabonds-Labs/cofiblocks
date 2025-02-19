import type { Role } from "@prisma/client";
import { compare } from "bcrypt";
import type { DefaultSession, NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "~/server/db";

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

export const authOptions: NextAuthOptions = {
	callbacks: {
		jwt: async ({ token, user }) => {
			if (user) {
				token.role = user.role;
				token.userId = user.id;
			}
			return token;
		},
		session: ({ session, token }) => {
			if (token) {
				session.user = {
					...session.user,
					id: token.userId ?? token.sub ?? "",
					role: token.role ?? "COFFEE_BUYER",
				};
			}
			return session;
		},
	},
	providers: [
		CredentialsProvider({
			name: "Email",
			credentials: {
				email: {
					label: "Email",
					type: "email",
					placeholder: "hello@example.com",
				},
				password: {
					label: "Password",
					type: "password",
				},
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				const user = await db.user.findUnique({
					where: { email: credentials.email },
				});

				if (!user?.password) {
					return null;
				}

				const isPasswordValid = await compare(
					credentials.password,
					user.password,
				);

				if (!isPasswordValid) {
					return null;
				}

				return {
					id: user.id,
					email: user.email,
					name: user.name,
					role: user.role,
				};
			},
		}),
	],
	pages: {
		signIn: "/auth/signin",
	},
	session: {
		strategy: "jwt",
	},
	secret: process.env.NEXTAUTH_SECRET,
};

export const getServerAuthSession = () => getServerSession(authOptions);
