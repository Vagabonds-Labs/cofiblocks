const CHIPI_SECRET_KEY = process.env.CHIPI_SECRET_KEY;
const CHIPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_CHIPI_PUBLIC_KEY;
const CHIPI_APP_ID = process.env.NEXT_PUBLIC_CHIPI_APP_ID;

if (!CHIPI_SECRET_KEY || !CHIPI_PUBLIC_KEY || !CHIPI_APP_ID) {
	throw new Error("Missing Chipi configuration");
}

export const chipiConfig = {
	apiKey: CHIPI_PUBLIC_KEY,
	appId: CHIPI_APP_ID,
	secretKey: CHIPI_SECRET_KEY,
}; 