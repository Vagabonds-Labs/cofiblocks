"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@repo/ui/button";
import InputField from "@repo/ui/form/inputField";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import { useTranslation } from "~/i18n";
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

	const userId = "cm2wbxug00000kkm7tvhlujf2";

	const { data: user, isLoading } = api.user.getUser.useQuery({ userId });

	const { handleSubmit, control, reset } = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			fullName: "",
			email: "",
			physicalAddress: "",
		},
	});

	useEffect(() => {
		if (user) {
			reset({
				fullName: user.name ?? "",
				email: user.email ?? "",
				physicalAddress: user.physicalAddress ?? "",
			});
		}
	}, [user, reset]);

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

	const onSubmit = (data: FormData) => {
		void updateProfile({
			userId,
			name: data.fullName,
			email: data.email,
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
							name="fullName"
							control={control}
							className="mb-4"
						/>
						<InputField
							label={t("email")}
							name="email"
							control={control}
							className="mb-4"
							inputClassName="cursor-not-allowed"
						/>
						<InputField
							label={t("physical_address")}
							name="physicalAddress"
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
