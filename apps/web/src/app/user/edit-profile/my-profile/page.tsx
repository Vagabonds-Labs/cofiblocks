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
	fullName: z.string().min(1, "Full name is required"),
	email: z.string().email("Invalid email").optional(),
	physicalAddress: z.string().min(1, "Address is required"),
});

type FormData = z.infer<typeof schema>;

function EditMyProfile() {
	const utils = api.useUtils();
	const [image, setImage] = useState<string | null>(null);

	const userId = "1"; // Assume you have the logic to get the userId

	const { data: user, isLoading } = api.user.getUser.useQuery({
		// TODO: get user id from session or prop
		userId,
	});

	useEffect(() => {
		if (user?.image) {
			setImage(user.image);
		}
	}, [user]);

	const { mutate: updateProfile } = api.user.updateUserProfile.useMutation({
		onSuccess: async () => {
			utils.user.getUser.invalidate({ userId });
			// TODO: display notification
			alert("Profile updated");
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
			fullName: user?.name || "",
			email: user?.email || "",
			physicalAddress: user?.physicalAddress || "",
		},
	});

	const onSubmit = async (data: FormData) => {
		updateProfile({
			userId: userId,
			name: data.fullName,
			physicalAddress: data.physicalAddress,
			image: image || undefined,
		});
	};

	const handleImageUpload = () => {
		// TODO: Implement image upload logic
		alert("Implement image upload logic");
		setImage(null);
	};

	return (
		<ProfileOptionLayout title="Edit my profile" backLink="/user/edit-profile">
			{isLoading ? (
				<div>Loading...</div>
			) : (
				<>
					<div className="mb-6 text-center">
						<div className="w-32 h-32 mx-auto mb-2 bg-gray-200 rounded-[3.125rem] overflow-hidden">
							{image ? (
								<img
									src={image}
									alt="Profile"
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
							label="Full Name"
							control={control}
							{...register("fullName")}
							className="mb-4"
						/>
						<InputField
							label="Email"
							control={control}
							{...register("email")}
							className="mb-4"
							disabled
							// TODO: update input style (set #F8FAFC as bg color and #788788 as text color)
							// TODO: Add support to add input icon (add email icon at the beginning of the input)
							inputClassName="cursor-not-allowed"
						/>
						<InputField
							label="City / Country"
							control={control}
							{...register("physicalAddress")}
							className="mb-6"
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

export default EditMyProfile;
