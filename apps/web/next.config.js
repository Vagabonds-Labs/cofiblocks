/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");
import nextI18NextConfig from "./next-i18next.config.js";

/** @type {import("next").NextConfig} */
const config = {
	...nextI18NextConfig,
};

export default config;
