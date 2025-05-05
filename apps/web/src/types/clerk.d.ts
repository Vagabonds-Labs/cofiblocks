declare namespace Clerk {
	interface UserPublicMetadata {
		wallet?: {
			account: string;
			publicKey: string;
			encryptedPrivateKey: string;
		};
		userType?: "COFFEE_PRODUCER" | "BUYER" | "ADMIN";
	}

	type UserPrivateMetadata = Record<string, unknown>;

	type UserUnsafeMetadata = Record<string, unknown>;
}
