import {
	AdjustmentsHorizontalIcon,
	CubeIcon,
	CurrencyDollarIcon,
	HeartIcon,
	NoSymbolIcon,
	ShoppingCartIcon,
	TicketIcon,
	TruckIcon,
	UserIcon,
} from "@heroicons/react/24/outline";
import type { Role } from "@prisma/client";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import LogoutModal from "~/app/_components/features/LogoutModal";

interface ProfileOptionsProps {
	address?: string;
}

type ProfileOption = {
	icon: typeof UserIcon;
	label: string;
	href?: string;
	onClick?: () => void;
	customClass?: string;
	iconColor?: string;
};

export function ProfileOptions({ address: _ }: ProfileOptionsProps) {
	const { t } = useTranslation();
	const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

	const closeLogoutModal = () => {
		setIsLogoutModalOpen(false);
	};

	const openLogoutModal = () => {
		setIsLogoutModalOpen(true);
	};

	// Common options that are always shown
	const commonOptions: ProfileOption[] = [
		{ icon: UserIcon, label: t("edit_profile"), href: "/user/edit-profile" },
		{
			icon: HeartIcon,
			label: t("favorite_products"),
			href: "/user/favorites",
		},
		{
			icon: CubeIcon,
			label: t("my_collectibles"),
			href: "/user/collectibles",
		},
		{
			icon: ShoppingCartIcon,
			label: t("my_orders"),
			href: "/user/my-orders",
		},
		{
			icon: AdjustmentsHorizontalIcon,
			label: t("settings"),
			href: "/user/settings",
		},
	];

	// Producer-specific options that are loaded after user data
	const producerOptions: ProfileOption[] = [
		{ icon: TicketIcon, label: t("my_coffee"), href: "/user/my-coffee" },
		{ icon: TruckIcon, label: t("my_sales"), href: "/user/my-sales" },
		{
			icon: CurrencyDollarIcon,
			label: t("my_claims"),
			href: "/user/my-claims",
		},
	];

	const renderOption = (option: ProfileOption) => (
		<div
			key={`${option.label}-${option.href ?? "action"}`}
			className="relative"
		>
			{option.href ? (
				<Link
					href={option.href}
					className={`flex items-center p-2 hover:bg-gray-100 rounded transition-colors ${option.customClass ?? ""}`}
				>
					<option.icon className={`w-5 h-5 mr-3 ${option.iconColor ?? ""}`} />
					<span>{option.label}</span>
				</Link>
			) : option.onClick ? (
				<button
					type="button"
					onClick={option.onClick}
					className={`flex items-center p-2 hover:bg-gray-100 rounded transition-colors w-full text-left ${option.customClass ?? ""}`}
				>
					<option.icon className={`w-5 h-5 mr-3 ${option.iconColor ?? ""}`} />
					<span>{option.label}</span>
				</button>
			) : null}
			<div className="h-px bg-gray-100 mx-2" />
		</div>
	);

	return (
		<div id="profile-options" className="bg-white rounded-lg overflow-hidden">
			{/* Always render common options first */}
			{commonOptions.slice(0, 4).map(renderOption)}

			{/* Show all producer options for now */}
			{producerOptions.map(renderOption)}

			{/* Always render remaining common options */}
			{commonOptions.slice(4).map(renderOption)}

			<LogoutModal isOpen={isLogoutModalOpen} onClose={closeLogoutModal} />
		</div>
	);
}
