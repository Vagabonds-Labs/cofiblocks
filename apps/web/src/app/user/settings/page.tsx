"use client";

import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@repo/ui/button";
import RadioButton from "@repo/ui/form/radioButton";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import BottomModal from "~/app/_components/ui/BottomModal";

interface SettingsProps {
	initialLanguage?: string;
}

const languageSchema = z.object({
	language: z.string(),
});

type FormValues = z.infer<typeof languageSchema>;

const LANGUAGE_KEY = "app_language";

export default function Settings({ initialLanguage = "en" }: SettingsProps) {
	const { i18n, t } = useTranslation();

	// Set a default language that matches on both server and client
	const [language, setLanguage] = useState<string>(initialLanguage);
	const [isLanguageModalOpen, setLanguageModalOpen] = useState<boolean>(false);

	const languages = ["en", "es", "pt"];

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

	const openLanguageModal = () => setLanguageModalOpen(true);
	const closeLanguageModal = () => setLanguageModalOpen(false);

	const handleLanguageClick = () => {
		openLanguageModal();
	};

	const onSubmit = async (data: FormValues) => {
		setLanguage(data.language);
		await i18n.changeLanguage(data.language);
		localStorage.setItem(LANGUAGE_KEY, data.language);
		closeLanguageModal();
	};

	return (
		<ProfileOptionLayout title={t("settings")}>
			<div>
				<div
					className="flex justify-between items-center py-2 cursor-pointer"
					onClick={handleLanguageClick}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							handleLanguageClick();
						}
					}}
					role="button"
					tabIndex={0}
				>
					<span className="text-lg font-medium">{t("language")}</span>
					<div className="flex items-center gap-2">
						<span className="text-content-body-default">
							{t(`language_name.${language}`)}
						</span>
						<ChevronRightIcon scale={16} className="w-5 h-5 ml-2" />
					</div>
				</div>

				<BottomModal isOpen={isLanguageModalOpen} onClose={closeLanguageModal}>
					<h3 className="text-xl font-semibold mb-4 text-content-title">
						{t("language")}
					</h3>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<div className="flex flex-col gap-2">
							{languages.map((lang, index) => (
								<div key={lang}>
									<label className="flex items-center gap-2">
										<RadioButton
											name="language"
											label={t(`language_name.${lang}`)}
											value={lang}
											control={control}
										/>
									</label>
									{index < languages.length - 1 && (
										<hr className="my-2 border-surface-border" />
									)}
								</div>
							))}
						</div>
						<Button type="submit" className="w-full">
							{t("apply")}
						</Button>
					</form>
				</BottomModal>
			</div>
		</ProfileOptionLayout>
	);
}
