"use client";

import { CameraIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@repo/ui/button";
import InputField from "@repo/ui/form/inputField";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import { api } from "~/trpc/react";

const schema = z.object({
	farmName: z.string().min(1, "Farm name is required"),
	region: z.string().min(1, "Region is required"),
	altitude: z.number().min(0, "Altitude must be a positive number"),
	coordinates: z
		.string()
		.regex(/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/, "Invalid coordinates format"),
	website: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

function EditMyFarmProfile() {
	const utils = api.useUtils();
	const [image, setImage] = useState<string | null>(null);

	const userId = "1"; // Assume you have the logic to get the userId

	const { data: userFarm, isLoading } = api.user.getUserFarm.useQuery({
		// TODO: get user id from session or prop
		userId,
	});

	useEffect(() => {
		if (userFarm?.farmImage) {
			setImage(userFarm.farmImage);
		}
	}, [userFarm]);

	const { mutate: updateFarm } = api.user.updateUserFarm.useMutation({
		onSuccess: async () => {
			utils.user.getUser.invalidate({ userId });
			utils.user.getUserFarm.invalidate({ userId });
			// TODO: display notification
			alert("Farm profile updated");
		},
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
		control,
	} = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			farmName: userFarm?.name || "",
			region: userFarm?.region || "",
			altitude: userFarm?.altitude || 0,
			coordinates: userFarm?.coordinates || "",
			website: userFarm?.website || "",
		},
	});

	const onSubmit = async (data: FormData) => {
		if (!userFarm) {
			// TODO: Display error in UI
			alert("User farm not found. Please contact support.");
			return;
		}

		updateFarm({
			farmId: userFarm.id,
			altitude: data.altitude,
			name: data.farmName,
			region: data.region,
			coordinates: data.coordinates,
			website: data.website || "",
			farmImage: image || undefined,
		});
	};

	const handleImageUpload = () => {
		// TODO: Implement image upload logic
		alert("Implement image upload logic");
		setImage(null);
	};

	return (
		<ProfileOptionLayout
			title="Edit my farm profile"
			backLink="/user/edit-profile"
		>
			{isLoading ? (
				<div>Loading...</div>
			) : (
				<>
					<div className="mb-6 text-center">
						<div className="w-32 h-32 mx-auto mb-2 bg-gray-200 rounded-[3.125rem] overflow-hidden">
							{image ? (
								<img
									src={image}
									alt="Farm Profile"
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center text-gray-400">
									No Image
								</div>
							)}
						</div>
						<Button
							className="mx-auto mt-4 w-46 h-10 px-2"
							onClick={handleImageUpload}
						>
							<CameraIcon className="w-6 h-6 mr-2" />
							Choose photo
						</Button>
					</div>

					<form onSubmit={handleSubmit(onSubmit)}>
						<InputField
							label="Farm Name"
							{...register("farmName")}
							control={control}
							className="mb-4"
						/>
						<InputField
							label="Region"
							{...register("region")}
							control={control}
							className="mb-4"
						/>
						<InputField
							label="Altitude (meters)"
							{...register("altitude", { valueAsNumber: true })}
							control={control}
						/>
						<InputField
							label="Coordinates"
							{...register("coordinates")}
							control={control}
						/>
						<InputField
							label="Website"
							{...register("website")}
							control={control}
						/>
						<Button type="submit" className="w-full mt-4">
							Save Changes
						</Button>
					</form>
				</>
			)}
		</ProfileOptionLayout>
	);
}

export default EditMyFarmProfile;
