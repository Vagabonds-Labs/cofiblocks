"use client";

import Button from "@repo/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function Confirmation() {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col items-center justify-center p-4 bg-white">
			<div className="w-full max-w-md flex flex-col items-center text-center space-y-6">
				<div className="relative w-32 h-32">
					<Image
						src="/images/confirmation.svg"
						alt="Coffee cup with floating coffee beans"
						width={128}
						height={128}
						priority
					/>
				</div>

				<div className="space-y-2">
					<h1 className="text-2xl font-bold text-gray-900">{t("congrats")}</h1>
					<p className="text-gray-600">{t("order_confirmation_message")}</p>
				</div>

				<Link href="/#" passHref>
					<Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black h-14">
						{t("track_in_my_orders")}
					</Button>
				</Link>
			</div>
		</div>
	);
}
