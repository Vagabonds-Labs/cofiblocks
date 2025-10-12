"use client";

import { H1, Text } from "@repo/ui/typography";
import type { TRPCClientError } from "@trpc/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Spinner from "~/app/_components/ui/Spinner";
import type { AppRouter } from "~/server/api/root";
import { api } from "~/trpc/react";

function VerifyEmailPageContent() {
	const { t } = useTranslation();
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token") ?? "";

	const verify = api.auth.verifyEmail.useMutation({ retry: false });

	const [phase, setPhase] = useState<"idle" | "pending" | "success" | "error">(
		"idle",
	);
	const [errMsg, setErrMsg] = useState("");
	const firedRef = useRef(false);

	useEffect(() => {
		if (!token || firedRef.current) return;
		firedRef.current = true;

		void (async () => {
			try {
				setPhase("pending");
				await verify.mutateAsync({ token }); // <-- explicit promise flow
				setPhase("success");
				const id = setTimeout(() => router.replace("/auth"), 2000);
				return () => clearTimeout(id);
			} catch (e) {
				const err = e as TRPCClientError<AppRouter>;
				setErrMsg(err?.message || "Verification failed");
				setPhase("error");
			}
		})();
	}, [token, verify, router]);

	if (!token) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-surface-inverse">
				<div className="text-center max-w-md mx-auto p-6">
					<div className="bg-error-default/10 p-6 rounded-lg mb-6">
						<H1 className="text-xl font-medium text-content-title mb-3">
							{t("auth.verification_failed")}
						</H1>
						<Text className="text-content-body-default mb-4">
							No verification token provided
						</Text>
						<button
							type="button"
							onClick={() => router.push("/auth")}
							className="bg-yellow-400 hover:bg-yellow-500 text-content-title font-medium py-3 px-8 rounded-lg border border-yellow-400 transition-all duration-300 text-lg shadow-sm"
						>
							{t("auth.back_to_auth")}
						</button>
					</div>
				</div>
			</div>
		);
	}

	if (phase === "pending" || phase === "idle") {
		return (
			<div className="min-h-screen flex items-center justify-center bg-surface-inverse">
				<div className="text-center">
					<Spinner size="lg" />
					<Text className="text-content-body-default mt-4">
						{t("auth.verifying_email")}
					</Text>
				</div>
			</div>
		);
	}

	if (phase === "success") {
		return (
			<div className="min-h-screen flex items-center justify-center bg-surface-inverse">
				<div className="text-center max-w-md mx-auto p-6">
					<div className="bg-success-default/10 p-6 rounded-lg mb-6">
						<H1 className="text-xl font-medium text-content-title mb-3">
							{t("auth.email_verified_success")}
						</H1>
						<Text className="text-content-body-default mb-4">
							{t("auth.back_to_auth")}
						</Text>
					</div>
				</div>
			</div>
		);
	}

	// error
	return (
		<div className="min-h-screen flex items-center justify-center bg-surface-inverse">
			<div className="text-center max-w-md mx-auto p-6">
				<div className="bg-error-default/10 p-6 rounded-lg mb-6">
					<H1 className="text-xl font-medium text-content-title mb-3">
						{t("auth.verification_failed")}
					</H1>
					<Text className="text-content-body-default mb-4">{errMsg}</Text>
					<button
						type="button"
						onClick={() => router.push("/auth")}
						className="bg-yellow-400 hover:bg-yellow-500 text-content-title font-medium py-3 px-8 rounded-lg border border-yellow-400 transition-all duration-300 text-lg shadow-sm"
					>
						{t("auth.back_to_auth")}
					</button>
				</div>
			</div>
		</div>
	);
}

export default function VerifyEmailPage() {
	return (
		<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
			<VerifyEmailPageContent />
		</Suspense>
	);
}
