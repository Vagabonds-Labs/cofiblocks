import type { Role } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { hash } from "bcrypt";
import { z } from "zod";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";
import { createAuthService } from "~/server/services/auth-service";
import { createEmailService } from "~/server/services/mail-service";
import { registerUser } from "~/services/cavos";

export const authRouter = createTRPCRouter({
	// lets do registerUser here
	registerUser: publicProcedure
		.input(
			z.object({
				email: z.string().email(),
				password: z.string().optional(),
				role: z.enum(["COFFEE_BUYER", "COFFEE_PRODUCER", "COFFEE_ROASTER"]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { email, password, role } = input;
			if (!email || !password) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Email or password is missing",
				});
			}

			// Check if user already exists
			const existingUser = await ctx.db.user.findUnique({
				where: { email },
			});

			if (existingUser) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Email already in use",
				});
			}

			const encrypted_password = await hash(password, 12);

			// Create new user
			const user = await ctx.db.user.create({
				data: {
					id: crypto.randomUUID(),
					email,
					password: encrypted_password,
					role: role as Role,
					walletAddress: crypto.randomUUID(),
				},
			});

			// Send verification email
			try {
				const emailSvc = createEmailService();
				const svc = createAuthService({
					db: ctx.db,
					mailer: {
						async sendVerification(email: string, url: string) {
							await emailSvc.sendVerificationEmail({
								to: email,
								verifyUrl: url,
								appName: "CofiBlocks",
							});
						},
					},
					appUrl: process.env.NEXT_PUBLIC_APP_URL,
				});

				await svc.requestEmailVerification(email);
			} catch (error) {
				console.error("Error sending verification email:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error sending verification email",
				});
			}

			return { ok: true };
		}),

	loginUser: publicProcedure
		.input(z.object({ email: z.string().email(), password: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { email, password } = input;
			return {};
		}),

	requestEmailVerification: publicProcedure
		.input(z.object({ email: z.string().email() }))
		.mutation(async ({ ctx, input }) => {
			const { email } = input;
			const emailSvc = createEmailService();
			const svc = createAuthService({
				db: ctx.db,
				mailer: {
					async sendVerification(email: string, url: string) {
						await emailSvc.sendVerificationEmail({
							to: email,
							verifyUrl: url,
							appName: "CofiBlocks",
						});
					},
				},
				appUrl: process.env.NEXT_PUBLIC_APP_URL,
			});

			if (!email) throw new Error("No email on session user");
			await svc.requestEmailVerification(email);
			return { ok: true };
		}),

	verifyEmail: publicProcedure
		.input(z.object({ token: z.string().min(1) }))
		.mutation(async ({ ctx, input }) => {
			const svc = createAuthService({
				db: ctx.db,
				mailer: { async sendVerification() {} }, // not needed here
				appUrl: process.env.NEXT_PUBLIC_APP_URL,
			});
			const res = await svc.verifyToken(input.token, "EMAIL_VERIFY");
			if (!res.ok) {
				throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid token" });
			}

			await ctx.db.user.update({
				where: { email: res.email },
				data: { emailVerified: new Date() },
			});

			// remove verification token
			await ctx.db.verificationToken.deleteMany({
				where: { identifier: res.email },
			});

			return { ok: true as const };
		}),
});
