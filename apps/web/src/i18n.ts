import i18n from "i18next";
import detector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import enTranslation from "../public/locales/en/common.json";
import esTranslation from "../public/locales/es/common.json";
import ptTranslation from "../public/locales/pt/common.json";

void i18n
	.use(detector)
	.use(initReactI18next)
	.init(
		{
			resources: {
				en: { common: enTranslation },
				es: { common: esTranslation },
				pt: { common: ptTranslation },
			},
			saveMissing: true,
			fallbackLng: "en",
			defaultNS: "common",
			debug: true,
			interpolation: {
				escapeValue: false,
			},
			detection: {
				order: ["cookie", "localStorage", "navigator"],
				caches: ["cookie", "localStorage"],
			},
		},
		(err, t) => {
			if (err) return console.error(err);
			console.log("Detected language:", i18n.language);
		},
	);

export default i18n;
