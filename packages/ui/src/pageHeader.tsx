import { ArrowLeftIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";

const BlockiesSvg = dynamic<{ address: string; size: number; scale: number }>(
	() => import("blockies-react-svg"),
	{ ssr: false },
);

interface PageHeaderProps {
	title: string | React.ReactNode;
	userAddress?: string;
	onLogout?: () => void;
	hideCart?: boolean;
	showBackButton?: boolean;
	onBackClick?: () => void;
	showBlockie?: boolean;
	rightActions?: React.ReactNode;
	showCart?: boolean;
	cartItemsCount?: number;
}

function PageHeader({
	title,
	userAddress,
	onLogout,
	hideCart = false,
	showBackButton = false,
	onBackClick,
	showBlockie = true,
	rightActions,
	showCart = true,
	cartItemsCount,
}: PageHeaderProps) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const { t } = useTranslation();
	const router = useRouter();

	const toggleMenu = () => {
		setIsMenuOpen((prevState) => !prevState);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key === "Enter" || event.key === " ") {
			toggleMenu();
		}
	};

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsMenuOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div className="w-full max-w-[24.375rem] h-16 py-2 bg-white flex justify-between items-center mx-auto space-x-4">
			<div className="flex items-center">
				{showBackButton && (
					<button onClick={onBackClick} className="mr-2" type="button">
						<ArrowLeftIcon className="w-6 h-6" />
					</button>
				)}
				{userAddress && (
					<div className="relative" ref={menuRef}>
						<div
							className="cursor-pointer"
							onClick={toggleMenu}
							onKeyDown={handleKeyDown}
							role="button"
							tabIndex={0}
						>
							{showBlockie && (
								<div className="rounded-full overflow-hidden relative w-8 h-8">
									<BlockiesSvg address={userAddress} size={8} scale={5} />
								</div>
							)}
						</div>
						{isMenuOpen && (
							<div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
								<div
									className="py-1"
									role="menu"
									aria-orientation="vertical"
									aria-labelledby="options-menu"
								>
									<a
										href="/user-profile"
										className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
										role="menuitem"
									>
										{t("Profile")}
									</a>
									<button
										className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
										onClick={onLogout}
										role="menuitem"
										type="button"
									>
										{t("disconnect")}
									</button>
								</div>
							</div>
						)}
					</div>
				)}
			</div>
			<div className="flex-grow text-left">
				<h1 className="text-2xl font-bold">{title}</h1>
			</div>
			<div className="flex items-center space-x-4">
				{rightActions}
				{showCart && (
					<button
						type="button"
						onClick={() => router.push("/shopping-cart")}
						className="p-2 relative"
						aria-label="Shopping cart"
					>
						<ShoppingCartIcon className="w-6 h-6" />
						{cartItemsCount && cartItemsCount > 0 ? (
							<span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-1">
								{cartItemsCount}
							</span>
						) : null}
					</button>
				)}
			</div>
		</div>
	);
}

export default PageHeader;
