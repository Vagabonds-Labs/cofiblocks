import { UserButton, useUser } from "@clerk/nextjs";
import {
	AdjustmentsHorizontalIcon,
	CubeIcon,
	CurrencyDollarIcon,
	HeartIcon,
	ShoppingCartIcon,
	TicketIcon,
	TruckIcon,
	UserIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useTranslation } from "react-i18next";

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
	const { user } = useUser();

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

	// Producer-specific options - Update logic based on Clerk metadata/roles later
	// For now, assume user exists means show producer options (adjust as needed)
	const producerOptions: ProfileOption[] = user
		? [
				{ icon: TicketIcon, label: t("my_coffee"), href: "/user/my-coffee" },
				{ icon: TruckIcon, label: t("my_sales"), href: "/user/my-sales" },
				{
					icon: CurrencyDollarIcon,
					label: t("my_claims"),
					href: "/user/my-claims",
				},
			]
		: [];

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
			<div className="relative">
				<div className="flex items-center p-2">
					{/* Apply similar structure/padding as renderOption links/buttons */}
					{/* UserButton might need specific alignment adjustments */}
					<div className="flex items-center gap-2">
						<UserButton afterSignOutUrl="/" />
						<div>User Profile</div>
					</div>
					{/* Optionally add a label next to it if desired */}
					{/* <span className="ml-3">Account</span> */}
				</div>
				{/* No separator needed after the last item */}
			</div>
			{/* Common options part 1 */}
			{commonOptions.slice(0, 4).map(renderOption)}

			{/* Producer options (conditionally rendered) */}
			{user && producerOptions.map(renderOption)}

			{/* Common options part 2 */}
			{commonOptions.slice(4).map(renderOption)}

			{/* Render UserButton styled like a menu item */}
		</div>
	);
}
