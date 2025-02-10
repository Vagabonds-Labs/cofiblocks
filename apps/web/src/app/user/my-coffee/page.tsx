"use client";

import Button from "@repo/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import { useTranslation } from "~/i18n";

export default function MyCoffee() {
	const { t } = useTranslation();
	const router = useRouter();
	const handleOfferMyCoffee = () => {
		router.push("/user/register-coffee");
	};

	return (
		<ProfileOptionLayout title={t("my_coffee")}>
			<div className="flex flex-col items-center justify-center bg-white rounded-lg p-6 mt-16">
				<Image
					src="/images/user-profile/coffee-bean-icon.svg"
					alt="Coffee Icon"
					width={96}
					height={96}
					className="mb-4"
				/>
				<p className="text-center text-content-body-default mb-4">
					{t("sell_your_coffee")}
				</p>
				<Button
					className="mx-auto mt-4 w-46 h-10 px-2"
					onClick={handleOfferMyCoffee}
				>
					{t("offer_coffee")}
				</Button>
			</div>
		</ProfileOptionLayout>
	);
}
