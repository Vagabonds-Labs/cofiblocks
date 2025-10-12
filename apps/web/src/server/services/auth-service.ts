// src/server/services/auth-service.ts
import crypto from "node:crypto";
import type { PrismaClient } from "@prisma/client";

export type TokenType = "EMAIL_VERIFY" | "PASSWORD_RESET";

export function createAuthService({
	db,
	mailer,
	appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
}: {
	db: PrismaClient;
	mailer: { sendVerification(email: string, url: string): Promise<void> };
	appUrl?: string;
}) {
	const createVerificationToken = async (opts: {
		email: string;
		ttlMinutes?: number;
	}) => {
		const { email, ttlMinutes = 1440 } = opts;

		// Remove tokens already in the database
		await db.verificationToken.deleteMany({
			where: { email: email.toLowerCase(), type: "EMAIL_VERIFY" },
		});

		const raw = crypto.randomBytes(32).toString("hex");
		console.log("****************************");
		console.log("raw token", raw);
		console.log("****************************");
		const hash = crypto.createHash("sha256").update(raw).digest("hex");
		const expires = new Date(Date.now() + ttlMinutes * 60_000);

		await db.$transaction([
			db.verificationToken.create({
				data: {
					id: crypto.randomUUID(),
					type: "EMAIL_VERIFY",
					email: email.toLowerCase(),
					token: hash,
					expires,
				},
			}),
		]);

		return { token: raw, expires };
	};

	const verifyToken = async (raw: string, type: TokenType) => {
		const hash = crypto.createHash("sha256").update(raw).digest("hex");
		const record = await db.verificationToken.findUnique({
			where: { token: hash, type: type },
		});

		if (!record || record.expires < new Date()) {
			return { ok: false as const, reason: "expired" as const };
		}

		await db.verificationToken.delete({ where: { token: hash, type: type } });
		return { ok: true as const, email: record.email };
	};

	const requestEmailVerification = async (email: string) => {
		const { token } = await createVerificationToken({ email });
		const url = `${appUrl}/auth/verify?token=${encodeURIComponent(token)}`;
		await mailer.sendVerification(email, url);
		return { url };
	};

	return {
		requestEmailVerification,
		createVerificationToken,
		verifyToken,
	};
}
