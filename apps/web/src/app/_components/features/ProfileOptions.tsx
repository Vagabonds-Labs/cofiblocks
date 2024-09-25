import {
	AdjustmentsHorizontalIcon,
	ChevronRightIcon,
	CubeIcon,
	HeartIcon,
	NoSymbolIcon,
	ShoppingCartIcon,
	TicketIcon,
	TruckIcon,
	UserIcon,
	WalletIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

type ProfileOption = {
	icon: React.ElementType;
	label: string;
	href: string;
	customClass?: string;
	iconColor?: string;
};

const profileOptions: ProfileOption[] = [
	{ icon: UserIcon, label: "Edit profile", href: "/user/edit-profile" },
	{ icon: TicketIcon, label: "My Coffee", href: "/user/my-coffee" },
	{ icon: TruckIcon, label: "My Sales", href: "/user/my-sales" },
	{ icon: ShoppingCartIcon, label: "My Orders", href: "/user/my-orders" },
	{ icon: HeartIcon, label: "Favorite products", href: "/user/favorites" },
	{ icon: CubeIcon, label: "My collectibles", href: "/user/collectibles" },
	{ icon: WalletIcon, label: "Wallet", href: "/user/wallet" },
	{
		icon: AdjustmentsHorizontalIcon,
		label: "Settings",
		href: "/user/settings",
	},
	{
		icon: NoSymbolIcon,
		label: "Log out",
		href: "/logout",
		customClass: "text-red-500",
		iconColor: "text-red-500",
	},
];

function ProfileOptions() {
	return (
		<div className="bg-white rounded-lg overflow-hidden">
			{profileOptions.map((option) => (
				<Link
					key={option.label}
					href={option.href}
					className={`flex items-center justify-between p-4 hover:bg-gray-50 ${
						option.label !== "Log out" ? "border-b border-[#EAF1EF]" : ""
					}`}
				>
					<div className="flex items-center">
						<option.icon
							className={`w-5 h-5 mr-3 ${option.label === "Log out" ? "text-red-500" : "text-[#3C3E3F]"}`}
						/>
						<span
							className={`${option.label === "Log out" ? "text-red-500" : "text-[#3C3E3F]"}`}
						>
							{option.label}
						</span>
					</div>
					<ChevronRightIcon scale={16} className="text-[#3C3E3F] w-5 h-5" />
				</Link>
			))}
		</div>
	);
}

export { ProfileOptions };
