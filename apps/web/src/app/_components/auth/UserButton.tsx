"use client";

import { UserButton as ClerkUserButton } from "@clerk/nextjs";

export default function UserButton() {
	return (
		<ClerkUserButton
			afterSignOutUrl="/"
			appearance={{
				elements: {
					userButtonAvatarBox: "h-8 w-8",
				},
			}}
		/>
	);
}
