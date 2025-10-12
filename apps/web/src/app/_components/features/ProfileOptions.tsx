import {
	AdjustmentsHorizontalIcon,
	CubeIcon,
	HeartIcon,
	ShoppingCartIcon,
	TicketIcon,
	TruckIcon,
	UserIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "next-auth/react";
// import { useCavosAuth } from "~/providers/cavos-auth";
import LogoutModal from "~/app/_components/features/LogoutModal";

type ProfileOption = {
	icon: typeof UserIcon;
	label: string;
	href?: string;
	onClick?: () => void;
	customClass?: string;
	iconColor?: string;
};

export function ProfileOptions() {
	const { t } = useTranslation();
	const { data: session } = useSession();
	const user = session?.user;
	// We'll use useCavosAuth later when needed
	// const { user } = useCavosAuth();
	const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

	const closeLogoutModal = () => {
		setIsLogoutModalOpen(false);
	};

	// Common options that are always shown
	const commonOptions: ProfileOption[] = [
		{ icon: UserIcon, label: t("user_profile"), href: "/user-profile" },
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

	// Producer-specific options that are shown only to producers
	// Since we don't have role in CavosUser, we'll show these options conditionally based on other factors
	// For now, let's include these options for all authenticated users
	const producerOptions: ProfileOption[] = [
		{ icon: TicketIcon, label: t("my_coffee"), href: "/user/my-coffee" },
		{ icon: TruckIcon, label: t("my_sales"), href: "/user/my-sales" },
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

			{/* Show producer options only for producers */}
			{(user?.role === "COFFEE_PRODUCER" || user?.role === "COFFEE_ROASTER") && producerOptions.map(renderOption)}

			{/* Always render remaining common options */}
			{commonOptions.slice(4).map(renderOption)}

			<LogoutModal isOpen={isLogoutModalOpen} onClose={closeLogoutModal} />
		</div>
	);
}
