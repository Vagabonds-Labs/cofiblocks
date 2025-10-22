"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { api } from "~/trpc/react";
import Button from "@repo/ui/button";
import Spinner from "@repo/ui/skeleton";
import { H1, Text } from "@repo/ui/typography";
import { validatePasswordOrThrow } from "~/utils/passwordValidation";

function ResetPasswordForm() {
	const { t } = useTranslation();
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	const resetPasswordMutation = api.auth.resetPassword.useMutation();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		if (!token) {
			setError(t("error.invalid_reset_token"));
			setIsLoading(false);
			return;
		}

		if (!password) {
			setError(t("error.password_required"));
			setIsLoading(false);
			return;
		}

		if (password !== confirmPassword) {
			setError(t("error.passwords_do_not_match"));
			setIsLoading(false);
			return;
		}

		try {
			validatePasswordOrThrow(password);
		} catch (validationError) {
			setError(validationError instanceof Error ? validationError.message : "Invalid password");
			setIsLoading(false);
			return;
		}

		try {
			await resetPasswordMutation.mutateAsync({
				token,
				password,
			});
			setSuccess(true);
			setIsLoading(false);
		} catch {
			setError(t("error.password_reset_failed"));
			setIsLoading(false);
			return;
		}
	};

	if (!token) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="max-w-md w-full space-y-8 p-8">
					<div className="text-center">
						<H1 className="text-2xl font-bold text-gray-900 mb-4">
							{t("auth.invalid_reset_link")}
						</H1>
						<Text className="text-gray-600 mb-6">
							{t("auth.invalid_reset_link_description")}
						</Text>
						<Button
							onClick={() => router.push("/auth")}
							className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3 px-4 rounded-lg"
						>
							{t("auth.back_to_signin")}
						</Button>
					</div>
				</div>
			</div>
		);
	}

	if (success) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="max-w-md w-full space-y-8 p-8">
					<div className="text-center">
						<div className="bg-green-100 p-6 rounded-lg mb-6">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-16 w-16 mx-auto text-green-600 mb-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<title>Password Reset Success</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
							<H1 className="text-xl font-medium text-gray-900 mb-3">
								{t("auth.password_reset_success")}
							</H1>
							<Text className="text-gray-600 mb-6">
								{t("auth.password_reset_success_description")}
							</Text>
						</div>
						<Button
							onClick={() => router.push("/auth")}
							className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3 px-4 rounded-lg"
						>
							{t("auth.back_to_signin")}
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full space-y-8 p-8">
				<div className="text-center mb-6">
					<Text className="text-gray-600 text-lg">
						{t("auth.reset_password_title")}
					</Text>
					<H1 className="text-2xl font-bold text-gray-900">{t("app.name")}</H1>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-4">
						<div className="relative">
							<input
								type={showPassword ? "text" : "password"}
								placeholder={t("auth.new_password_placeholder")}
								required
								className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500 shadow-sm"
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
									<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<title>Hide Password</title>
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
									</svg>
								) : (
									<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<title>Show Password</title>
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
									</svg>
								)}
							</button>
						</div>

						<div className="relative">
							<input
								type={showConfirmPassword ? "text" : "password"}
								placeholder={t("auth.confirm_new_password_placeholder")}
								required
								className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500 shadow-sm"
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
									<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<title>Hide Confirm Password</title>
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
									</svg>
								) : (
									<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<title>Show Confirm Password</title>
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
									</svg>
								)}
							</button>
						</div>
					</div>

					{error && (
						<div className="text-sm text-red-600 text-center">
							{error}
						</div>
					)}

					<Button
						type="submit"
						disabled={isLoading}
						className="w-full px-4 py-3 bg-yellow-400 text-black text-base font-medium rounded-lg border border-yellow-400 transition-all duration-300 hover:bg-yellow-500 shadow-sm"
					>
						{isLoading ? (
							<div className="flex items-center justify-center space-x-2">
								<Spinner />
								<span>{t("auth.resetting_password")}</span>
							</div>
						) : (
							<span>{t("auth.reset_password")}</span>
						)}
					</Button>
				</form>
			</div>
		</div>
	);
}

export default function ResetPasswordPage() {
	return (
		<Suspense fallback={
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="max-w-md w-full space-y-8 p-8">
					<div className="text-center">
						<Spinner />
						<Text className="text-gray-600 mt-4">Loading...</Text>
					</div>
				</div>
			</div>
		}>
			<ResetPasswordForm />
		</Suspense>
	);
}
