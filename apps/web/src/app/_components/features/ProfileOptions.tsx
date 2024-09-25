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
        customClass: "text-error-default",
        iconColor: "text-error-default",
    },
];

function ProfileOptions() {
	return (
		<>
			<div className="bg-surface-inverse rounded-lg overflow-hidden">
				{profileOptions.map((option, index) => (
					<>
						<Link
							key={option.label}
							href={option.href}
							className="flex items-center justify-between w-full py-1"
                        >
                            <div className="flex items-center">
                                <option.icon
                                    className={`w-5 h-5 mr-3 ${option.iconColor || "text-content-body-default"}`}
                                />
                                <span
                                    className={
                                        option.customClass || "text-content-body-default"
                                    }
                                >
                                    {option.label}
                                </span>
                            </div>
                            <ChevronRightIcon className="text-content-body-default w-5 h-5" />
                        </Link>
						{index < profileOptions.length - 1 && (
							<hr className="my-2 surface-primary-soft" />
						)}
					</>
				))}
			</div>
		</>
	);
}

export { ProfileOptions };
