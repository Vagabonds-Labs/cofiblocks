import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import IconButton from "./iconButton";

interface HamburgerMenuProps {
	isOpen: boolean;
	onToggle: () => void;
	children: React.ReactNode;
}

export function HamburgerMenu({
	isOpen,
	onToggle,
	children,
}: HamburgerMenuProps) {
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				onToggle();
			}
		}

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, onToggle]);

	return (
		<div className="relative">
			<IconButton
				icon={<Bars3Icon className="w-6 h-6" />}
				onClick={onToggle}
				variant="primary"
				size="lg"
				className="relative z-50 p-2 hover:bg-gray-100 rounded-full transition-colors !bg-transparent !text-content-body-default !border-0"
				aria-label="Toggle menu"
				aria-expanded={isOpen}
			/>

			<AnimatePresence>
				{isOpen && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 0.5 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 bg-black z-40"
							onClick={onToggle}
						/>

						{/* Menu */}
						<motion.div
							ref={menuRef}
							initial={{ x: "100%" }}
							animate={{ x: 0 }}
							exit={{ x: "100%" }}
							transition={{ type: "spring", damping: 25, stiffness: 200 }}
							className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 overflow-y-auto"
						>
							<div className="sticky top-0 p-4 flex justify-between items-center bg-white border-b border-surface-primary-soft">
								<h2 className="text-lg font-semibold text-content-title">
									Menu
								</h2>
								<IconButton
									icon={<XMarkIcon className="w-6 h-6" />}
									onClick={onToggle}
									variant="primary"
									size="lg"
									className="relative z-50 p-2 hover:bg-warning-default/10 rounded-full transition-colors !bg-transparent !text-warning-default !border-0"
									aria-label="Close menu"
								/>
							</div>
							<div className="p-4">{children}</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
}
