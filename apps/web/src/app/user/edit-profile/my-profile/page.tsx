"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@repo/ui/button";
import InputField from "@repo/ui/form/inputField";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
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
	const { data: session } = useSession();
	const router = useRouter();

	const {
		handleSubmit,
		formState: { errors },
		control,
		reset,
	} = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			fullName: "",
			email: "",
			physicalAddress: "",
		},
	});

	const userId = session?.user?.id;

	const {
		data: user,
		isLoading: isLoadingUser,
		error: userError,
	} = api.user.getUser.useQuery(
		{ userId: userId ?? "" },
		{
			enabled: !!userId,
			retry: false,
		},
	);

	// If there's an error fetching the user, redirect to home
	useEffect(() => {
		if (!userId) {
			router.push("/");
			return;
		}

		if (userError) {
			toast.error(t("error_fetching_profile"));
			router.push("/");
		}
	}, [userError, router, t, userId]);

	useEffect(() => {
		if (user) {
			reset({
				fullName: user.name ?? "",
				email: user.email ?? "",
				physicalAddress: user.physicalAddress ?? "",
			});
		}
	}, [user, reset]);

	const { mutate: updateProfile, isPending } =
		api.user.updateUserProfile.useMutation({
			onSuccess: async () => {
				try {
					await utils.user.getUser.invalidate({ userId });
					toast.success(t("profile_updated"));
				} catch (error) {
					console.error(t("invalidate_user_data_failed"), error);
				}
			},
			onError: (error) => {
				console.error("Error updating profile:", error);
				if (error.message?.includes("Record to update not found")) {
					toast.error(t("user_not_found"));
					router.push("/");
				} else {
					toast.error(t("error_updating_profile"));
				}
			},
		});

	const onSubmit = (data: FormData) => {
		if (!userId) {
			toast.error(t("session_expired"));
			router.push("/");
			return;
		}

		updateProfile({
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
			<div className="p-4 bg-white rounded-lg">
				<form onSubmit={handleSubmit(onSubmit)}>
					<InputField
						label={t("full_name")}
						name="fullName"
						control={control}
						className="mb-4"
						disabled={isLoadingUser}
					/>
					<InputField
						label={t("email")}
						name="email"
						control={control}
						className="mb-4"
						inputClassName="cursor-not-allowed"
						disabled={isLoadingUser}
					/>
					<InputField
						label={t("physical_address")}
						name="physicalAddress"
						control={control}
						className="mb-4"
						disabled={isLoadingUser}
					/>
					<Button
						type="submit"
						className="w-full mt-4"
						disabled={isPending || isLoadingUser}
					>
						{isPending
							? t("saving_changes")
							: isLoadingUser
								? t("loading")
								: t("save_changes")}
					</Button>
				</form>
			</div>
		</ProfileOptionLayout>
	);
}

export default EditMyProfile;
