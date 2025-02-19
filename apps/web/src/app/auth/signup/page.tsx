"use client";

import Button from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function SignUp() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		try {
			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password, name }),
			});

			if (!response.ok) {
				const data = (await response.json()) as { error: string };
				throw new Error(data.error ?? "Failed to register");
			}

			// Sign in after successful registration
			await signIn("credentials", {
				email,
				password,
				callbackUrl: "/",
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Registration failed");
		}
	};

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
					<CardTitle>Create your account</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<label
								htmlFor="name"
								className="block text-sm font-medium text-content-body-default"
							>
								Full Name
							</label>
							<input
								id="name"
								type="text"
								required
								className="w-full p-2 rounded-lg border border-surface-border bg-surface-inverse focus:outline-none focus:ring-2 focus:ring-surface-secondary-default"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>

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
							Create account
						</Button>

						<p className="text-sm text-center text-content-body-default">
							Already have an account?{" "}
							<Link
								href="/auth/signin"
								className="font-medium text-content-title hover:text-surface-secondary-default transition-colors"
							>
								Sign in
							</Link>
						</p>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
