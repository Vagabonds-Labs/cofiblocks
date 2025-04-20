"use client";

import { useUser } from "@clerk/nextjs";

export default function ClerkDemoPage() {
	const { isLoaded: clerkLoaded, isSignedIn, user } = useUser();

	if (!clerkLoaded) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				Loading...
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8 px-4">
			<h1 className="text-3xl font-bold mb-6">Clerk Authentication Demo</h1>

			<div className="mb-8 p-4 bg-gray-50 rounded-lg">
				<h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
				<p className="mb-2">
					<span className="font-medium">Signed In: </span>
					<span className={isSignedIn ? "text-green-600" : "text-red-600"}>
						{isSignedIn ? "Yes" : "No"}
					</span>
				</p>
				{isSignedIn && (
					<p className="mb-2">
						<span className="font-medium">User Email: </span>
						<span>{user?.primaryEmailAddress?.emailAddress ?? "No email"}</span>
					</p>
				)}
			</div>

			<div className="mb-8 p-4 bg-gray-50 rounded-lg">
				<h2 className="text-xl font-semibold mb-4">Authentication Links</h2>
				<div className="flex gap-4">
					{!isSignedIn ? (
						<>
							<a
								href="/sign-in"
								className="px-4 py-2 bg-blue-500 text-white rounded"
							>
								Sign In
							</a>
							<a
								href="/sign-up"
								className="px-4 py-2 bg-green-500 text-white rounded"
							>
								Sign Up
							</a>
						</>
					) : (
						<a
							href="/sign-out"
							className="px-4 py-2 bg-red-500 text-white rounded"
						>
							Sign Out
						</a>
					)}
				</div>
			</div>
		</div>
	);
}
