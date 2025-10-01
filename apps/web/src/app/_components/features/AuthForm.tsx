"use client";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Button from "@repo/ui/button";
import { H1, Text } from "@repo/ui/typography";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import GoogleAuth from "~/app/_components/features/GoogleAuth";
import Spinner from "~/app/_components/ui/Spinner";
import { api } from "~/trpc/react";
import {
	getLoginErrorMessage,
	getRegisterErrorMessage,
} from "~/utils/parseErrorMessages";

interface AuthFormProps {
	initialMode?: "signin" | "signup";
}

export default function AuthForm({ initialMode = "signin" }: AuthFormProps) {
	const { t } = useTranslation();
	const router = useRouter();
	const registerUserMutation = api.auth.registerUser.useMutation();
	const loginUserMutation = api.auth.loginUser.useMutation();
	const [mode, setMode] = useState<"signin" | "signup">(initialMode);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [verificationSent, setVerificationSent] = useState(false);

	// Update URL when mode changes
	useEffect(() => {
		if (mode === "signup") {
			router.replace("/auth?mode=signup");
		} else {
			router.replace("/auth");
		}
	}, [mode, router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		if (mode === "signin") {
			try {
				await loginUserMutation.mutateAsync({ email, password });
				router.push("/marketplace");
			} catch (loginError) {
				setError(t(getLoginErrorMessage(loginError as Error)));
				setIsLoading(false);
				return;
			}
		} else {
			// Sign Up
			// Check if passwords match
			if (password !== confirmPassword) {
				setError(t("error.passwords_do_not_match"));
				setIsLoading(false);
				return;
			}

			try {
				await registerUserMutation.mutateAsync({
					email,
					password,
					role: "COFFEE_BUYER",
				});
				setVerificationSent(true);
				setIsLoading(false);
			} catch (signupError) {
				setError(t(getRegisterErrorMessage(signupError as Error)));
				setIsLoading(false);
				return;
			}
		}
	};

	const toggleMode = () => {
		setMode(mode === "signin" ? "signup" : "signin");
		setError("");
		setConfirmPassword("");
	};

	return (
		<div className="p-6 flex flex-col h-full overflow-y-auto">
			{/* Header */}
			<div className="text-center mb-6">
				<Text className="text-content-title text-lg">
					{mode === "signin" ? t("auth.welcome_to") : t("auth.create_account")}
				</Text>
				<H1 className="text-content-title">{t("app.name")}</H1>
			</div>

			{verificationSent ? (
				// Verification Message
				<div className="flex-1 flex flex-col items-center justify-center text-center">
					<div className="bg-success-default/10 p-6 rounded-lg mb-6">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-16 w-16 mx-auto text-success-default mb-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<title>Email verification</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
							/>
						</svg>
						<h3 className="text-xl font-medium text-content-title mb-3">
							{t("auth.verification_email_sent")}
						</h3>
						<p className="text-content-body-default mb-4">
							{t("auth.check_email_instructions")}
						</p>
						<p className="text-sm text-content-body-soft mb-3">
							{t("auth.email_sent_to")} <strong>{email}</strong>
						</p>
						<p className="text-xs text-content-body-soft bg-yellow-100 p-2 rounded">
							<strong>{t("auth.verification_important")}:</strong>{" "}
							{t("auth.verification_must_return")}
						</p>
					</div>
					<div className="flex flex-col items-center">
						<button
							type="button"
							onClick={() => {
								setMode("signin");
								setVerificationSent(false);
								setEmail("");
								setPassword("");
								setConfirmPassword("");
							}}
							className="bg-yellow-400 hover:bg-yellow-500 text-content-title font-medium py-3 px-8 rounded-lg border border-yellow-400 transition-all duration-300 text-lg shadow-sm"
						>
							{t("auth.back_to_signin")}
						</button>
					</div>
				</div>
			) : (
				// Form
				<>
					<form onSubmit={handleSubmit} className="flex-1 flex flex-col">
						<div className="space-y-3 mb-4">
							<div className="mb-3">
								<input
									type="email"
									placeholder={t("auth.email_placeholder")}
									required
									className="w-full p-3 rounded-lg border border-surface-border bg-surface-inverse focus:outline-none focus:ring-2 focus:ring-surface-secondary-default shadow-sm"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</div>

							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									placeholder={t("auth.password_placeholder")}
									required
									className="w-full p-3 rounded-lg border border-surface-border bg-surface-inverse focus:outline-none focus:ring-2 focus:ring-surface-secondary-default shadow-sm"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
									aria-label={
										showPassword
											? t("auth.hide_password")
											: t("auth.show_password")
									}
								>
									{showPassword ? (
										<EyeSlashIcon className="h-5 w-5" />
									) : (
										<EyeIcon className="h-5 w-5" />
									)}
								</button>
							</div>

							{mode === "signup" && (
								<div className="relative">
									<input
										type={showConfirmPassword ? "text" : "password"}
										placeholder={t("auth.confirm_password_placeholder")}
										required={mode === "signup"}
										className="w-full p-3 rounded-lg border border-surface-border bg-surface-inverse focus:outline-none focus:ring-2 focus:ring-surface-secondary-default shadow-sm"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
										aria-label={
											showConfirmPassword
												? t("auth.hide_password")
												: t("auth.show_password")
										}
									>
										{showConfirmPassword ? (
											<EyeSlashIcon className="h-5 w-5" />
										) : (
											<EyeIcon className="h-5 w-5" />
										)}
									</button>
								</div>
							)}

							{error && (
								<div className="text-sm text-error-default text-center mt-2">
									{error}
								</div>
							)}
						</div>

						<Button
							type="submit"
							variant="secondary"
							size="lg"
							disabled={isLoading}
							className="w-full px-4 py-3 bg-yellow-400 text-content-title text-base font-medium rounded-lg border border-yellow-400 transition-all duration-300 hover:bg-yellow-500 shadow-sm mb-4"
						>
							{isLoading ? (
								<div className="flex items-center justify-center space-x-2">
									<Spinner size="sm" />
									<span>
										{mode === "signin"
											? t("auth.signing_in")
											: t("auth.creating_account")}
									</span>
								</div>
							) : (
								<div className="flex items-center justify-center">
									<span>
										{mode === "signin" ? t("auth.sign_in") : t("auth.sign_up")}
									</span>
								</div>
							)}
						</Button>

						{/* Divider */}
						<div className="relative my-4">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-surface-border" />
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-2 bg-surface-inverse text-content-body-default">
									{mode === "signup"
										? t("auth.recommended_option")
										: t("auth.or_continue_with")}
								</span>
							</div>
						</div>

						{/* Google Auth */}
						<div className="w-full mb-4 flex justify-center">
							<div className="w-full">
								<GoogleAuth finalRedirectUri="/auth/callback" />
								{mode === "signup" && (
									<p className="text-xs text-content-body-soft mt-2 text-center">
										{t("auth.google_sign_in_recommended")}
									</p>
								)}
							</div>
						</div>
					</form>

					{/* Toggle Mode Button */}
					<div className="mt-auto pt-2">
						<button
							type="button"
							onClick={toggleMode}
							className="block w-full text-center text-content-title text-sm font-normal underline transition-colors duration-300 hover:text-content-title-hover"
						>
							{mode === "signin"
								? t("auth.create_account_link")
								: t("auth.already_have_account")}
						</button>
					</div>
				</>
			)}
		</div>
	);
}
