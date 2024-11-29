"use client";

import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";

type EditProfileOption = {
	imgUrl: string;
	labelKey: string;
	href: string;
	customClass?: string;
	iconColor?: string;
};

const editProfileOptions: EditProfileOption[] = [
	{
		imgUrl: "/images/user-profile/avatar.svg",
		labelKey: "edit_my_profile",
		href: "/user/edit-profile/my-profile",
	},
	{
		imgUrl: "/images/user-profile/farm-avatar.svg",
		labelKey: "edit_my_farm_profile",
		href: "/user/edit-profile/farm-profile",
	},
];

export default function EditProfile() {
	const { t } = useTranslation();
	const lastOptionIndex = editProfileOptions.length - 1;
	return (
		<ProfileOptionLayout title={t("edit_my_profile")}>
			<div className="bg-white overflow-hidden">
				{editProfileOptions.map((option, index) => (
					<Link
						key={option.href}
						href={option.href}
						className={`flex items-center justify-between p-4 hover:bg-surface-secondary-soft ${
							lastOptionIndex !== index
								? "border-b border-surface-primary-soft"
								: ""
						}`}
					>
						<div className="flex items-center">
							<Image
								src={option.imgUrl}
								alt={t("profile_option_image_alt", {
									label: t(option.labelKey),
								})}
								width={20}
								height={20}
								className="mr-3"
							/>
							<span className="text-content-title">{t(option.labelKey)}</span>
						</div>
						<ChevronRightIcon
							scale={16}
							className="text-content-body-default w-5 h-5"
						/>
					</Link>
				))}
			</div>
		</ProfileOptionLayout>
	);
}
