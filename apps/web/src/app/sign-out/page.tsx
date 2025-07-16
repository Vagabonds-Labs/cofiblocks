"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignOutPage() {
	const { signOut } = useClerk();
	const router = useRouter();

	useEffect(() => {
		const performSignOut = async () => {
			try {
				await signOut();
				router.push("/");
			} catch (error) {
				console.error("Error signing out:", error);
				// Optionally handle the error, e.g., redirect to an error page
			}
		};

		void performSignOut();
	}, [signOut, router]);

	return (
		<div className="flex justify-center items-center min-h-screen">
			<p>Signing out...</p>
		</div>
	);
}
