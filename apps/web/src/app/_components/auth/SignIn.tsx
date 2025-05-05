"use client";

import { SignInButton } from "@clerk/nextjs";

export default function SignIn() {
	return (
		<SignInButton mode="modal">
			<button className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors" type="button">
				Sign In
			</button>
		</SignInButton>
	);
}
