"use client";

import { SignInWithGoogle } from "cavos-service-sdk";
import { useTranslation } from "react-i18next";

interface GoogleAuthProps {
	finalRedirectUri?: string;
	text?: string;
}

export default function GoogleAuth({
	finalRedirectUri = "/auth/callback",
	text,
}: GoogleAuthProps) {
	const { t } = useTranslation();

	// Get app ID and network from environment variables
	const appId = process.env.NEXT_PUBLIC_CAVOS_APP_ID ?? "";
	const network = process.env.NEXT_PUBLIC_CAVOS_NETWORK ?? "sepolia";

	// Ensure we have a valid absolute URL for the redirect URI
	let absoluteRedirectUri = finalRedirectUri;

	// If we're in the browser, construct an absolute URL
	if (typeof window !== "undefined") {
		// Check if finalRedirectUri is already absolute
		if (!finalRedirectUri.startsWith("http")) {
			const baseUrl = window.location.origin;
			absoluteRedirectUri = `${baseUrl}${finalRedirectUri.startsWith("/") ? "" : "/"}${finalRedirectUri}`;
		}

		// Set flag for Google auth when component mounts
		localStorage.setItem("pendingGoogleAuth", "true");
	}

	return (
		<SignInWithGoogle
			appId={appId}
			network={network}
			finalRedirectUri={absoluteRedirectUri}
			text={text ?? t("auth.continue_with_google")}
			// Apply styling to the parent container instead since className is not supported
			style={{ width: "100%" }}
		/>
	);
}
