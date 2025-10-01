export function getLoginErrorMessage(loginError: Error): string {
	// Handle login errors with user-friendly messages
	if (loginError instanceof Error) {
		if (
			loginError.message.includes("verification") ||
			loginError.message.includes("verify") ||
			loginError.message.includes("email")
		) {
			return "error.email_verification_required";
		}
		if (
			loginError.message.includes("USER_ALREADY_EXISTS") ||
			loginError.message.includes("already registered")
		) {
			return "error.user_already_exists_signin";
		}
		return "error.invalid_credentials";
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
