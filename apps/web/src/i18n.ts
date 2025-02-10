"use client";

import i18n from "i18next";
import detector from "i18next-browser-languagedetector";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import {
	initReactI18next,
	useTranslation as useTranslationOrg,
} from "react-i18next";

import enTranslation from "../public/locales/en/common.json";
import esTranslation from "../public/locales/es/common.json";
import ptTranslation from "../public/locales/pt/common.json";

const cookieName = "i18nextLng";

// Detect initial language before initializing i18n
const detectedLng: string | boolean =
	(typeof window !== "undefined" && window.localStorage.getItem(cookieName)) ??
	(typeof navigator !== "undefined" && navigator.language.split("-")[0]) ??
	"en";

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
			lng: detectedLng ? String(detectedLng) : "en",
			fallbackLng: "en",
			defaultNS: "common",
			debug: true, // Disable debug logs in production
			interpolation: { escapeValue: false },
			detection: {
				order: ["cookie", "localStorage", "navigator"],
				caches: ["cookie", "localStorage"],
			},
		},
		(err) => {
			if (err) console.error(err);
		},
	);

export function useTranslation() {
	const [cookies, setCookie] = useCookies([cookieName]);
	const ret = useTranslationOrg();
	const { i18n } = ret;
	const [activeLng, setActiveLng] = useState(i18n.language);
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		if (!isReady) {
			setIsReady(true);
		}
	}, [isReady]);

	useEffect(() => {
		if (activeLng !== i18n.language) {
			setActiveLng(i18n.language);
		}
	}, [i18n.language, activeLng]);

	useEffect(() => {
		if (cookies[cookieName] !== i18n.language) {
			setCookie(cookieName, i18n.language, { path: "/" });
		}
	}, [i18n.language, cookies, setCookie]);

	if (!isReady || !i18n.language)
		return { t: (key: string, options?: Record<string, unknown>) => key, i18n }; // Prevent rendering until language is ready

	return ret;
}

export default i18n;
