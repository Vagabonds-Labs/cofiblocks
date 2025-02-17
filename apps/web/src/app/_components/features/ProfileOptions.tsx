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
	WalletIcon,
} from "@heroicons/react/24/outline";
import type { Role } from "@prisma/client";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import LogoutModal from "~/app/_components/features/LogoutModal";
import { UserWalletsModal } from "~/app/_components/features/UserWalletsModal";
import { api } from "~/trpc/react";

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
	const { data: user, isLoading } = api.user.getMe.useQuery(undefined, {
		staleTime: 30_000, // Keep data fresh for 30 seconds
		refetchOnWindowFocus: false,
	});

	const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
	const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

	const closeLogoutModal = () => {
		setIsLogoutModalOpen(false);
	};

	const openLogoutModal = () => {
		setIsLogoutModalOpen(true);
	};

	const openWalletModal = () => {
		setIsWalletModalOpen(true);
	};

	const closeWalletModal = () => {
		setIsWalletModalOpen(false);
	};

	const getOptionsForRole = (userRole?: Role): ProfileOption[] => {
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
			{ icon: WalletIcon, label: t("wallet"), onClick: openWalletModal },
			{
				icon: AdjustmentsHorizontalIcon,
				label: t("settings"),
				href: "/user/settings",
			},
			{
				icon: NoSymbolIcon,
				label: t("log_out"),
				customClass: "text-error-default",
				iconColor: "text-error-default",
				onClick: openLogoutModal,
			},
		];

		if (userRole === "COFFEE_PRODUCER") {
			return [
				...commonOptions.slice(0, 4),
				{ icon: TicketIcon, label: t("my_coffee"), href: "/user/my-coffee" },
				{ icon: TruckIcon, label: t("my_sales"), href: "/user/my-sales" },
				{
					icon: CurrencyDollarIcon,
					label: t("my_claims"),
					href: "/user/my-claims",
				},
				...commonOptions.slice(4),
			];
		}

		return commonOptions;
	};

	const profileOptions = getOptionsForRole(user?.role);

	if (isLoading) {
		return (
			<div className="bg-white rounded-lg overflow-hidden p-4">
				<div className="animate-pulse space-y-4">
					{[1, 2, 3, 4, 5].map((i) => (
						<div key={i} className="h-10 bg-gray-200 rounded" />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-lg overflow-hidden">
			{profileOptions.map((option) => (
				<div
					key={`${option.label}-${option.href ?? "action"}`}
					className="relative"
				>
					{option.href ? (
						<Link
							href={option.href}
							className={`flex items-center p-2 hover:bg-gray-100 rounded transition-colors ${option.customClass ?? ""}`}
						>
							<option.icon
								className={`w-5 h-5 mr-3 ${option.iconColor ?? ""}`}
							/>
							<span>{option.label}</span>
						</Link>
					) : option.onClick ? (
						<button
							type="button"
							onClick={option.onClick}
							className={`flex items-center p-2 hover:bg-gray-100 rounded transition-colors w-full text-left ${option.customClass ?? ""}`}
						>
							<option.icon
								className={`w-5 h-5 mr-3 ${option.iconColor ?? ""}`}
							/>
							<span>{option.label}</span>
						</button>
					) : null}
					<div className="h-px bg-gray-100 mx-2" />
				</div>
			))}
			<LogoutModal isOpen={isLogoutModalOpen} onClose={closeLogoutModal} />
			<UserWalletsModal isOpen={isWalletModalOpen} onClose={closeWalletModal} />
		</div>
	);
}
