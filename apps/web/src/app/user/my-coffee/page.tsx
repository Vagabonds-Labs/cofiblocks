"use client";

import Button from "@repo/ui/button";
import { useRouter } from "next/navigation";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";

export default function MyCoffee() {
	const router = useRouter();
	const handleOfferMyCoffee = () => {
		router.push("/user/register-coffee");
	};

	return (
		<ProfileOptionLayout title="My coffee">
			<div className="flex flex-col items-center justify-center bg-white rounded-lg p-6 mt-16">
				<img
					src="/images/user-profile/coffee-bean-icon.svg"
					alt="Coffee Icon"
					className="w-24 h-24 mb-4"
				/>
				<p className="text-center text-content-body-default mb-4">
					Would you like to sell your coffee?
				</p>
				<Button
					className="mx-auto mt-4 w-46 h-10 px-2"
					onClick={handleOfferMyCoffee}
				>
					Offer my coffee
				</Button>
			</div>
		</ProfileOptionLayout>
	);
}
