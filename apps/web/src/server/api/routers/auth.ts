// Role type from Prisma schema
type Role = "ADMIN" | "COFFEE_PRODUCER" | "COFFEE_ROASTER" | "COFFEE_BUYER";
import { TRPCError } from "@trpc/server";
import { hash } from "bcrypt";
import crypto from "node:crypto";
import { z } from "zod";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";
import { createAuthService } from "~/server/services/auth-service";
import { registerUserCavos } from "~/server/services/cavos";
import { createEmailService } from "~/server/services/mail-service";
import { validatePasswordOrThrow } from "~/utils/passwordValidation";

export const authRouter = createTRPCRouter({
	// lets do registerUser here
	registerUser: publicProcedure
		.input(
			z.object({
				email: z.string().email(),
				password: z.string().min(1, "Password is required"),
				role: z.enum(["COFFEE_BUYER", "COFFEE_PRODUCER", "COFFEE_ROASTER"]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { email: email_raw, password, role } = input;
			const email = email_raw.toLowerCase();

			// Validate password meets security requirements
			try {
				validatePasswordOrThrow(password);
			} catch (error) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: error instanceof Error ? error.message : "Invalid password",
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
			await ctx.db.user.create({
				data: {
					id: crypto.randomUUID(),
					email,
					password: encrypted_password,
					role: role as Role,
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

	requestEmailVerification: publicProcedure
		.input(z.object({ email: z.string().email() }))
		.mutation(async ({ ctx, input }) => {
			const { email: email_raw } = input;
			const email = email_raw.toLowerCase();
			const emailSvc = createEmailService();
			const svc = createAuthService({
				db: ctx.db,
				mailer: {
					async sendVerification(email: string, url: string) {
						await emailSvc.sendVerificationEmail({
							to: email,
							verifyUrl: url,
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
				mailer: { async sendVerification() { /* not needed here */ } }, // not needed here
				appUrl: process.env.NEXT_PUBLIC_APP_URL,
			});
			const res = await svc.verifyToken(input.token, "EMAIL_VERIFY");
			if (!res.ok) {
				throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid token" });
			}

			// Try registering user with Cavos
			let walletAddress = null;
			try {
				const userAuthData = await registerUserCavos(res.email, ctx.db);
				walletAddress = userAuthData.wallet_address;
			} catch (error) {
				console.error("Error creating or updating Cavos User:", error);
			}

			await ctx.db.user.update({
				where: { email: res.email },
				data: { emailVerified: new Date(), walletAddress: walletAddress },
			});

			// remove verification token
			await ctx.db.verificationToken.deleteMany({
				where: { email: res.email, type: "EMAIL_VERIFY" },
			});

			return { ok: true as const };
		}),

	registerUserCavos: protectedProcedure.mutation(async ({ ctx }) => {
		const email = ctx.session?.user?.email;
		const userId = ctx.session?.user?.id;
		if (!email || !userId) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Unauthorized user",
			});
		}
		const user = await ctx.db.user.findUnique({
			where: { id: userId },
		});
		if (!user?.emailVerified) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Email not verified",
			});
		}

		let walletAddress = null;
		try {
			const userAuthData = await registerUserCavos(email, ctx.db);
			walletAddress = userAuthData.wallet_address;
		} catch (error) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: `Unable to register user with Cavos: ${String(error)}`,
			});
		}

		// update user with Cavos User data
		await ctx.db.user.update({
			where: { id: userId },
			data: { walletAddress: walletAddress },
		});
		return { ok: true as const };
	}),

	requestPasswordReset: publicProcedure
		.input(z.object({ email: z.string().email() }))
		.mutation(async ({ ctx, input }) => {
			const { email: email_raw } = input;
			const email = email_raw.toLowerCase();

			// Check if user exists
			const user = await ctx.db.user.findUnique({
				where: { email },
			});

			if (!user) {
				// Don't reveal if user exists or not for security
				return { ok: true };
			}

			// Create password reset token
			const emailSvc = createEmailService();
			const svc = createAuthService({
				db: ctx.db,
				mailer: {
					async sendVerification(email: string, url: string) {
						await emailSvc.sendPasswordResetEmail({
							to: email,
							resetUrl: url,
							userName: user.name,
						});
					},
				},
				appUrl: process.env.NEXT_PUBLIC_APP_URL,
			});

			// Create password reset token (similar to email verification but with different type)
			const { token } = await svc.createVerificationToken({ 
				email, 
				ttlMinutes: 1440 // 24 hours
			});
			
			// Update token type to PASSWORD_RESET
			await ctx.db.verificationToken.updateMany({
				where: { 
					email: email, 
					token: crypto.createHash("sha256").update(token).digest("hex") 
				},
				data: { type: "PASSWORD_RESET" }
			});

			const url = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${encodeURIComponent(token)}`;
			await emailSvc.sendPasswordResetEmail({
				to: email,
				resetUrl: url,
				userName: user.name,
			});

			return { ok: true };
		}),

	resetPassword: publicProcedure
		.input(z.object({ 
			token: z.string().min(1),
			password: z.string().min(1, "Password is required")
		}))
		.mutation(async ({ ctx, input }) => {
			const { token, password } = input;

			// Validate password meets security requirements
			try {
				validatePasswordOrThrow(password);
			} catch (error) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: error instanceof Error ? error.message : "Invalid password",
				});
			}

			// Verify the reset token
			const svc = createAuthService({
				db: ctx.db,
				mailer: { async sendVerification() { /* not needed here */ } },
				appUrl: process.env.NEXT_PUBLIC_APP_URL,
			});

			const res = await svc.verifyToken(token, "PASSWORD_RESET");
			if (!res.ok) {
				throw new TRPCError({ 
					code: "BAD_REQUEST", 
					message: "Invalid or expired reset token" 
				});
			}

			// Hash the new password
			const encrypted_password = await hash(password, 12);

			// Update user's password
			await ctx.db.user.update({
				where: { email: res.email },
				data: { password: encrypted_password },
			});

			return { ok: true };
		}),
});
