"use client";

import { XMarkIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function BetaAnnouncement() {
	const [isVisible, setIsVisible] = useState(true);
	const { t } = useTranslation();

	if (!isVisible) return null;

	return (
		<div className="relative isolate flex items-center gap-x-6 overflow-hidden bg-yellow-50 px-6 py-2.5 sm:px-3.5">
			<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
				<p className="text-sm leading-6 text-yellow-800">
					<strong className="font-semibold">
						⚠️ {t("platform_update.title")}
					</strong>
					<svg
						viewBox="0 0 2 2"
						className="mx-2 inline h-0.5 w-0.5 fill-current"
						aria-hidden="true"
					>
						<circle cx={1} cy={1} r={1} />
					</svg>
					{t("platform_update.message")}
				</p>
			</div>
			<div className="flex flex-1 justify-end">
				<button
					type="button"
					className="-m-3 p-3 focus-visible:outline-offset-[-4px]"
					onClick={() => setIsVisible(false)}
				>
					<span className="sr-only">{t("alert.dismiss_button")}</span>
					<XMarkIcon className="h-5 w-5 text-yellow-800" aria-hidden="true" />
				</button>
			</div>
		</div>
	);
}
