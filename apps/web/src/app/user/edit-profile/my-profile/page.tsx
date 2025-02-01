"use client";

import { CameraIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@repo/ui/button";
import InputField from "@repo/ui/form/inputField";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import { api } from "~/trpc/react";

const schema = z.object({
	fullName: z.string().min(1, "full_name_required"),
	email: z.string().email("invalid_email").optional(),
	physicalAddress: z.string().min(1, "address_required"),
});

type FormData = z.infer<typeof schema>;

function EditMyProfile() {
	const utils = api.useUtils();
	const { t } = useTranslation();
	const [image, setImage] = useState<string | null>(null);

	const userId = "1"; // Assume you have the logic to get the userId

	const { data: user, isLoading } = api.user.getUser.useQuery({
		userId,
	});

	useEffect(() => {
		if (user?.image) {
			setImage(user.image);
		}
	}, [user]);

	const { mutate: updateProfile } = api.user.updateUserProfile.useMutation({
		onSuccess: async () => {
			try {
				await utils.user.getUser.invalidate({ userId });
				alert(t("profile_updated"));
			} catch (error) {
				console.error(t("invalidate_user_data_failed"), error);
			}
		},
	});

	const { register, handleSubmit, control } = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			fullName: user?.name ?? "",
			email: user?.email ?? "",
			physicalAddress: user?.physicalAddress ?? "",
		},
	});

	const onSubmit = (data: FormData) => {
		void updateProfile({
			userId,
			name: data.fullName,
			physicalAddress: data.physicalAddress,
		});
	};

	return (
		<ProfileOptionLayout
			title={t("edit_my_profile")}
			backLink="/user/edit-profile"
		>
			{isLoading ? (
				<div>{t("loading")}</div>
			) : (
				<>
					<form onSubmit={handleSubmit(onSubmit)}>
						<InputField
							label={t("full_name")}
							{...register("fullName")}
							onChange={(value: string) => {
								void register("fullName").onChange({ target: { value } });
							}}
							control={control}
							className="mb-4"
						/>
						<InputField
							label={t("email")}
							{...register("email")}
							onChange={(value: string) => {
								void register("email").onChange({ target: { value } });
							}}
							control={control}
							className="mb-4"
							// disabled
							inputClassName="cursor-not-allowed"
						/>
						<InputField
							label={t("physical_address")}
							{...register("physicalAddress")}
							onChange={(value: string) => {
								void register("physicalAddress").onChange({
									target: { value },
								});
							}}
							control={control}
							className="mb-4"
						/>
						<Button type="submit" className="w-full mt-4">
							{t("save_changes")}
						</Button>
					</form>
				</>
			)}
		</ProfileOptionLayout>
	);
}

export default EditMyProfile;
