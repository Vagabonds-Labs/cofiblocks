import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { v4 as uuidv4 } from "uuid";

const BlockiesSvg = dynamic<{ address: string; size: number; scale: number }>(
	() => import("blockies-react-svg"),
	{ ssr: false },
);

interface PageHeaderProps {
	title: string;
	leftIcon?: React.ReactNode;
	rightIcons?: React.ReactNode[];
	userAddress?: string;
	onLogout?: () => void;
}

function PageHeader({
	title,
	leftIcon,
	rightIcons = [],
	userAddress,
	onLogout,
}: PageHeaderProps) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const { t } = useTranslation();

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
		<div className="w-full max-w-[24.375rem] h-16 px-4 py-2 bg-surface-inverse flex justify-between items-center mx-auto">
			<div className="flex items-center">
				{userAddress && (
					<div className="relative" ref={menuRef}>
						<div
							className="cursor-pointer "
							onClick={toggleMenu}
							onKeyDown={handleKeyDown}
							role="button"
							tabIndex={0}
						>
							<div className="rounded-full overflow-hidden relative">
								<BlockiesSvg address={userAddress} size={8} scale={5} />
							</div>
							<div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white z-10" />
						</div>
						{isMenuOpen && (
							<div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
								<div
									className="py-1"
									role="menu"
									aria-orientation="vertical"
									aria-labelledby="options-menu"
								>
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
			<div className="flex-grow text-center">
				<div className="text-content-title text-2xl font-bold font-manrope leading-[2.125rem]">
					{title}
				</div>
			</div>
			<div className="flex items-center gap-8">
				{rightIcons.map((icon) => (
					<div key={uuidv4()} className="w-6 h-6">
						{icon}
					</div>
				))}
				{leftIcon && <div className="w-6 h-6">{leftIcon}</div>}
			</div>
		</div>
	);
}

export default PageHeader;
