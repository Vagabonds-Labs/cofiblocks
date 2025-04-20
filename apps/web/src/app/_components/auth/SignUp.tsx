"use client";

import { SignUpButton } from "@clerk/nextjs";

export default function SignUp() {
	return (
		<SignUpButton mode="modal">
			<button className="btn btn-secondary" type="button">
				Sign Up
			</button>
		</SignUpButton>
	);
}
