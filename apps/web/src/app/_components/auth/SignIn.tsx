"use client";

import { SignInButton } from "@clerk/nextjs";

export default function SignIn() {
	return (
		<SignInButton mode="modal">
			<button className="btn btn-primary" type="button">
				Sign In
			</button>
		</SignInButton>
	);
}
