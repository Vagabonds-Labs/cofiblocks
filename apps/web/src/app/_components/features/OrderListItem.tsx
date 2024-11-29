"use client";

import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface OrderListItemProps {
	productName: string;
	name: string;
	status: string;
	onClick: () => void;
}

export default function OrderListItem({
	productName,
	name,
	status,
	onClick,
}: OrderListItemProps) {
	const { t } = useTranslation();

	return (
		<Link href="#" onClick={onClick} className="block">
			<div
				className="flex items-center justify-between py-4"
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						onClick();
					}
				}}
				role="button"
				tabIndex={0}
			>
				<div className="flex items-center space-x-4">
					<Image
						src="/images/cafe2.webp"
						alt={t("product_image_alt", { productName })}
						width={48}
						height={48}
						className="rounded-md object-cover"
					/>
					<div>
						<h3 className="font-semibold">{productName}</h3>
						<p className="text-sm text-gray-500">{name}</p>
					</div>
				</div>
				<div className="flex items-center space-x-2">
					<span
						className={`px-2 py-1 text-sm rounded-full ${
							status === t("delivered")
								? "bg-surface-primary-default text-white"
								: "bg-surface-primary-soft text-content-body-default"
						}`}
					>
						{t(`order_status.${status.toLowerCase()}`)}
					</span>
					<ChevronRightIcon className="text-content-body-default w-5 h-5" />
				</div>
			</div>
		</Link>
	);
}
