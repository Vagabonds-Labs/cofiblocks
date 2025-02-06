export default {
	i18n: {
		defaultLocale: "en",
		locales: ["en", "es", "pt"],
		localeDetection: true,
	},
	detection: {
		order: ["cookie", "localStorage", "navigator", "querystring"],
		caches: ["cookie", "localStorage"],
	},
};
