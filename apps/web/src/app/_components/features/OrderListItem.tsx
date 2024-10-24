"use client";

import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

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
						alt="Product"
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
							status === "Delivered"
								? "bg-surface-primary-default text-white"
								: "bg-surface-primary-soft text-content-body-default"
						}`}
					>
						{status}
					</span>
					<ChevronRightIcon className="text-content-body-default w-5 h-5" />
				</div>
			</div>
		</Link>
	);
}
