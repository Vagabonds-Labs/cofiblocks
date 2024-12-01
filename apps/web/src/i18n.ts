import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "../public/locales/en/common.json";
import esTranslation from "../public/locales/es/common.json";
import ptTranslation from "../public/locales/pt/common.json";

void i18n.use(initReactI18next).init({
	resources: {
		en: { common: enTranslation },
		es: { common: esTranslation },
		pt: { common: ptTranslation },
	},
	lng: "en",
	fallbackLng: "en",
	defaultNS: "common",
	debug: true,
	interpolation: {
		escapeValue: false,
	},
});

export default i18n;
