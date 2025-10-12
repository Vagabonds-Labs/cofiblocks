/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");
import nextI18NextConfig from "./next-i18next.config.js";

/** @type {import("next").NextConfig} */
const config = {
	i18n: {
		...nextI18NextConfig.i18n,
		localeDetection: false,
	},
	reactStrictMode: true,
	transpilePackages: ["@repo/ui"],
	images: {
		domains: ["gateway.pinata.cloud"],
		unoptimized: process.env.NODE_ENV === "production" && process.env.VERCEL === "1",
		loader: "default",
		path: "/_next/image",
	},
	webpack: (config) => {
		config.resolve.fallback = {
			...config.resolve.fallback,
			fs: false,
		};
		return config;
	},
};

export default config;
