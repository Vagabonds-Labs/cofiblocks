import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "../public/locales/en/common.json";
import esTranslation from "../public/locales/es/common.json";
import ptTranslation from "../public/locales/pt/common.json";

void i18n.use(initReactI18next).init({
	lng: "en",
	debug: false,
	fallbackLng: "en",
	resources: {
		en: {
			translation: enTranslation,
		},
		es: {
			translation: esTranslation,
		},
		pt: {
			translation: ptTranslation,
		},
	},
	interpolation: {
		escapeValue: false,
	},
});

export default i18n;
