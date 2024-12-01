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
	farmName: z.string().min(1, "farm_name_required"),
	region: z.string().min(1, "region_required"),
	altitude: z.number().min(0, "altitude_positive"),
	coordinates: z
		.string()
		.regex(/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/, "coordinates_invalid"),
	website: z.string().url("url_invalid").optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

function EditMyFarmProfile() {
	const utils = api.useUtils();
	const { t } = useTranslation();
	const [image, setImage] = useState<string | null>(null);

	const userId = 1; // Assume you have the logic to get the userId

	const { data: userFarm, isLoading } = api.user.getUserFarm.useQuery({
		userId,
	});

	useEffect(() => {
		if (userFarm?.farmImage) {
			setImage(userFarm.farmImage);
		}
	}, [userFarm]);

	const { mutate: updateFarm } = api.user.updateUserFarm.useMutation({
		onSuccess: () => {
			void utils.user.getUser.invalidate({ userId: userId.toString() });
			void utils.user.getUserFarm.invalidate({ userId });
			alert(t("farm_profile_updated"));
		},
		onError: (error) => {
			console.error("Error updating farm profile:", error);
			alert(t("error_updating_farm"));
		},
	});

	const { register, handleSubmit, control } = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			farmName: userFarm?.name ?? "",
			region: userFarm?.region ?? "",
			altitude: userFarm?.altitude ?? 0,
			coordinates: userFarm?.coordinates ?? "",
			website: userFarm?.website ?? "",
		},
	});

	const onSubmit = (data: FormData) => {
		if (!userFarm) {
			alert(t("user_farm_not_found"));
			return;
		}

		updateFarm({
			farmId: userFarm.id,
			altitude: data.altitude,
			name: data.farmName,
			region: data.region,
			coordinates: data.coordinates,
			website: data.website ?? "",
			farmImage: image ?? undefined,
		});
	};

	const handleImageUpload = () => {
		alert(t("implement_image_upload"));
		setImage(null);
	};

	return (
		<ProfileOptionLayout
			title={t("edit_my_farm_profile")}
			backLink="/user/edit-profile"
		>
			{isLoading ? (
				<div>{t("loading")}</div>
			) : (
				<>
					<div className="mb-6 text-center">
						<div className="w-32 h-32 mx-auto mb-2 bg-gray-200 rounded-[3.125rem] overflow-hidden">
							{image ? (
								<Image
									src={image}
									alt={t("farm_profile_image")}
									width={128}
									height={128}
									className="object-cover"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center text-gray-400">
									{t("no_image")}
								</div>
							)}
						</div>
						<Button
							className="mx-auto mt-4 w-46 h-10 px-2"
							onClick={handleImageUpload}
						>
							<CameraIcon className="w-6 h-6 mr-2" />
							{t("choose_photo")}
						</Button>
					</div>

					<form onSubmit={handleSubmit(onSubmit)}>
						<InputField
							label={t("farm_name")}
							{...register("farmName")}
							onChange={(value: string) => {
								void register("farmName").onChange({ target: { value } });
							}}
							control={control}
							className="mb-4"
						/>
						<InputField
							label={t("region")}
							{...register("region")}
							onChange={(value: string) => {
								void register("region").onChange({ target: { value } });
							}}
							control={control}
							className="mb-4"
						/>
						<InputField
							label={t("altitude_meters")}
							{...register("altitude", { valueAsNumber: true })}
							onChange={(value: string) => {
								void register("altitude").onChange({
									target: { value: Number.parseFloat(value) },
								});
							}}
							control={control}
						/>
						<InputField
							label={t("coordinates")}
							{...register("coordinates")}
							onChange={(value: string) => {
								void register("coordinates").onChange({ target: { value } });
							}}
							control={control}
						/>
						<InputField
							label={t("website")}
							{...register("website")}
							onChange={(value: string) => {
								void register("website").onChange({ target: { value } });
							}}
							control={control}
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

export default EditMyFarmProfile;
