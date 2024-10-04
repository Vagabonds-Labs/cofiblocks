"use client";

import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@repo/ui/button";
import RadioButton from "@repo/ui/form/radioButton";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import BottomModal from "~/app/_components/ui/BottomModal";

interface SettingsProps {
	initialLanguage?: string;
}

// TODO: Move this to config file
const languageMap: Record<string, string> = {
	en: "English",
	es: "Spanish",
	pt: "Portuguese",
};

const languageSchema = z.object({
	language: z.string(),
});

type FormValues = z.infer<typeof languageSchema>;

export default function Settings({ initialLanguage = "en" }: SettingsProps) {
	const [language, setLanguage] = useState<string>(initialLanguage ?? "en");
	const [isLanguageModalOpen, setLanguageModalOpen] = useState<boolean>(false);

	const languagesKeys = Object.keys(languageMap);

	const { control, handleSubmit } = useForm<FormValues>({
		defaultValues: {
			language: initialLanguage ?? "en",
		},
		resolver: zodResolver(languageSchema),
	});

	const openLanguageModal = () => setLanguageModalOpen(true);
	const closeLanguageModal = () => setLanguageModalOpen(false);

	const handleLanguageClick = () => {
		openLanguageModal();
	};

	const onSubmit = (data: FormValues) => {
		// TODO: Implement language apply
		setLanguage(data.language);
		closeLanguageModal();
	};

	return (
		<ProfileOptionLayout title="Settings">
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
					<span className="text-lg font-medium">Language</span>
					<div className="flex items-center gap-2">
						<span className="text-content-body-default">
							{languageMap[language]}
						</span>
						<ChevronRightIcon scale={16} className="w-5 h-5 ml-2" />
					</div>
				</div>

				<BottomModal isOpen={isLanguageModalOpen} onClose={closeLanguageModal}>
					<h3 className="text-xl font-semibold mb-4 text-content-title">
						Language
					</h3>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<div className="flex flex-col gap-2">
							{languagesKeys.map((lang, index) => (
								<>
									<label key={lang} className="flex items-center gap-2">
										<RadioButton
											name="language"
											label={languageMap[lang] || lang}
											value={lang}
											control={control}
										/>
									</label>
									{index < languagesKeys.length - 1 && (
										<hr className="my-2 border-surface-border" />
									)}
								</>
							))}
						</div>
						<Button type="submit" className="w-full">
							Apply
						</Button>
					</form>
				</BottomModal>
			</div>
		</ProfileOptionLayout>
	);
}
