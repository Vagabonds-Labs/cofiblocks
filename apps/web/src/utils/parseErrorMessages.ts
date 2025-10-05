export function getLoginErrorMessage(loginError: string): string {
	// Handle login errors with user-friendly messages
	if (
		loginError.includes("verification") ||
		loginError.includes("verify") ||
		loginError.includes("email")
	) {
		return "error.email_verification_required";
	}
	if (
		loginError.includes("USER_ALREADY_EXISTS") ||
		loginError.includes("already registered")
	) {
		return "error.user_already_exists_signin";
	}
	if (loginError.includes("Email not verified")) {
		return "error.user_not_verified";
	}
	return "error.invalid_credentials";
}

export function getRegisterErrorMessage(registerError: Error): string {
	if (registerError instanceof Error) {
		// Check if user already exists - they should sign in instead
		if (
			registerError.message.includes("USER_ALREADY_EXISTS") ||
			registerError.message.includes("already registered")
		) {
			return "error.user_already_exists_signup";
		}
		// Check if it's an organization token error
		if (
			registerError.message.includes("INVALID_ORG_TOKEN") ||
			registerError.message.includes("Invalid organization token")
		) {
			return "auth.use_google_signin";
		}
		return registerError.message;
	}
	return "error.registration_failed";
}
