"use client";

import { ChevronRightIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@repo/ui/button";
import { InfoCard } from "@repo/ui/infoCard";
import { Text } from "@repo/ui/typography";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";

const languageSchema = z.object({
	language: z.string(),
});

type FormValues = z.infer<typeof languageSchema>;

const LANGUAGE_KEY = "app_language";

const LANGUAGES = [
	{
		code: "en",
		flag: "🇺🇸",
		name: "English",
	},
	{
		code: "es",
		flag: "🇪🇸",
		name: "Español",
	},
	{
		code: "pt",
		flag: "🇧🇷",
		name: "Português",
	},
] as const;

export default function Settings() {
	const { i18n, t } = useTranslation();
	const [language, setLanguage] = useState<string>("en");

	const { control, handleSubmit, setValue } = useForm<FormValues>({
		defaultValues: {
			language: language,
		},
		resolver: zodResolver(languageSchema),
	});

	useEffect(() => {
		// Update language from localStorage after component mounts
		const savedLanguage = localStorage.getItem(LANGUAGE_KEY);
		if (savedLanguage && savedLanguage !== language) {
			setLanguage(savedLanguage);
			setValue("language", savedLanguage);
			void i18n.changeLanguage(savedLanguage);
		}
	}, [i18n, language, setValue]);

	const handleLanguageSelect = async (langCode: string) => {
		setLanguage(langCode);
		await i18n.changeLanguage(langCode);
		localStorage.setItem(LANGUAGE_KEY, langCode);
		setValue("language", langCode);
	};

	const currentLanguage = LANGUAGES.find((lang) => lang.code === language);

	return (
		<ProfileOptionLayout title={t("settings")}>
			<div className="space-y-4">
				<Text className="text-lg font-medium mb-4">{t("language")}</Text>
				<div className="grid grid-cols-1 gap-3">
					{LANGUAGES.map((lang) => (
						<button
							key={lang.code}
							type="button"
							onClick={() => handleLanguageSelect(lang.code)}
							className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
								language === lang.code
									? "border-surface-secondary-default bg-surface-primary-soft"
									: "border-surface-border hover:border-surface-secondary-default"
							}`}
						>
							<div className="flex items-center gap-3">
								<span className="text-2xl" role="img" aria-label={lang.name}>
									{lang.flag}
								</span>
								<Text className="font-medium">{lang.name}</Text>
							</div>
							{language === lang.code && (
								<div className="w-3 h-3 rounded-full bg-surface-secondary-default" />
							)}
						</button>
					))}
				</div>
			</div>
		</ProfileOptionLayout>
	);
}
