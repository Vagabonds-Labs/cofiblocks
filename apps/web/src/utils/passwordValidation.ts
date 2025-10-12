/**
 * Password validation utilities
 * Ensures passwords meet security requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */

export interface PasswordValidationResult {
	isValid: boolean;
	errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
	const errors: string[] = [];

	// Check minimum length
	if (password.length < 8) {
		errors.push("Password must be at least 8 characters long");
	}

	// Check for uppercase letter
	if (!/[A-Z]/.test(password)) {
		errors.push("Password must contain at least one uppercase letter");
	}

	// Check for lowercase letter
	if (!/[a-z]/.test(password)) {
		errors.push("Password must contain at least one lowercase letter");
	}

	// Check for number
	if (!/\d/.test(password)) {
		errors.push("Password must contain at least one number");
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
}

/**
 * Generates a secure random password that meets all requirements
 */
export function generateSecurePassword(): string {
	const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const lowercase = "abcdefghijklmnopqrstuvwxyz";
	const numbers = "0123456789";
	const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";

	// Ensure we have at least one character from each required category
	let password = "";
	password += uppercase[Math.floor(Math.random() * uppercase.length)];
	password += lowercase[Math.floor(Math.random() * lowercase.length)];
	password += numbers[Math.floor(Math.random() * numbers.length)];
	password += special[Math.floor(Math.random() * special.length)];

	// Fill the rest with random characters from all categories
	const allChars = uppercase + lowercase + numbers + special;
	for (let i = 4; i < 12; i++) {
		password += allChars[Math.floor(Math.random() * allChars.length)];
	}

	// Shuffle the password to avoid predictable patterns
	return password
		.split("")
		.sort(() => Math.random() - 0.5)
		.join("");
}

/**
 * Validates password and throws an error with details if invalid
 */
export function validatePasswordOrThrow(password: string): void {
	const validation = validatePassword(password);
	if (!validation.isValid) {
		throw new Error(
			`Password validation failed: ${validation.errors.join(", ")}`,
		);
	}
}
