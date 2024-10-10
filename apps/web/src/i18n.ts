import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
	lng: "en",
	debug: false,
	fallbackLng: "en",
	resources: {
		en: {
			translation: require("../public/locales/en/common.json"),
		},
		es: {
			translation: require("../public/locales/es/common.json"),
		},
		pt: {
			translation: require("../public/locales/pt/common.json"),
		},
	},
	interpolation: {
		escapeValue: false,
	},
});

export default i18n;
