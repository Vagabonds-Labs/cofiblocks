"use client";

import Button from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { WalletConnectFlow } from "~/app/_components/features";

export default function SignIn() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		try {
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
			});

			if (result?.error) {
				setError("Invalid credentials");
				return;
			}

			setIsLoggedIn(true);
		} catch (_) {
			setError("An error occurred during sign in");
		}
	};

	if (isLoggedIn) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-surface-primary-soft p-4">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle>Connect Your Wallet</CardTitle>
					</CardHeader>
					<CardContent>
						<WalletConnectFlow />
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-surface-primary-soft p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4">
						<Image
							src="/images/logo.png"
							alt="CofiBlocks Logo"
							width={48}
							height={48}
							className="mx-auto"
						/>
					</div>
					<CardTitle>Welcome back</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<label
								htmlFor="email"
								className="block text-sm font-medium text-content-body-default"
							>
								Email
							</label>
							<input
								id="email"
								type="email"
								required
								className="w-full p-2 rounded-lg border border-surface-border bg-surface-inverse focus:outline-none focus:ring-2 focus:ring-surface-secondary-default"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<label
								htmlFor="password"
								className="block text-sm font-medium text-content-body-default"
							>
								Password
							</label>
							<input
								id="password"
								type="password"
								required
								className="w-full p-2 rounded-lg border border-surface-border bg-surface-inverse focus:outline-none focus:ring-2 focus:ring-surface-secondary-default"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>

						{error && (
							<div className="text-sm text-error-default text-center">
								{error}
							</div>
						)}

						<Button type="submit" variant="primary" className="w-full">
							Sign in
						</Button>

						<p className="text-sm text-center text-content-body-default">
							Don&apos;t have an account?{" "}
							<Link
								href="/auth/signup"
								className="font-medium text-content-title hover:text-surface-secondary-default transition-colors"
							>
								Create one
							</Link>
						</p>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
