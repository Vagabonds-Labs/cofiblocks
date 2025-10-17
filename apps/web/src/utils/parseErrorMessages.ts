export function getLoginErrorMessage(loginError: string): string {
	// Handle login errors with user-friendly messages
	const message = loginError?.toString() ?? "";
	const msg = message.toLowerCase();

	// Specific: user not verified
	if (
		msg.includes("email not verified") ||
		msg.includes("not verified") ||
		msg.includes("verify your email")
	) {
		return "error.user_not_verified";
	}

	// User already exists scenarios (if surfaced during login)
	if (
		msg.includes("user_already_exists") ||
		msg.includes("already registered")
	) {
		return "error.user_already_exists_signin";
	}

	// Invalid credentials (wrong email/password)
	if (
		msg.includes("invalid email or password") ||
		msg.includes("invalid credentials") ||
		msg.includes("credentialsSignin".toLowerCase())
	) {
		return "error.invalid_credentials";
	}

	// Default to invalid credentials for unknown auth errors
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
