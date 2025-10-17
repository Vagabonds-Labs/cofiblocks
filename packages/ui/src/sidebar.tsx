"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import IconButton from "./iconButton";
import { Text } from "./typography";

interface SidebarProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
	trigger?: React.ReactNode;
	footer?: React.ReactNode;
}

export function Sidebar({
	isOpen,
	onClose,
	title,
	children,
	trigger,
	footer,
}: SidebarProps) {
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				onClose();
			}
		}

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, onClose]);

	return (
		<div className="relative">
			{trigger}

			<AnimatePresence>
				{isOpen && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 0.5 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 bg-black z-[60]"
							onClick={onClose}
						/>

						{/* Menu */}
						<motion.div
							ref={menuRef}
							initial={{ x: "100%" }}
							animate={{ x: 0 }}
							exit={{ x: "100%" }}
							transition={{ type: "spring", damping: 25, stiffness: 200 }}
							className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-[70] overflow-y-auto flex flex-col"
						>
							<div className="sticky top-0 p-4 flex justify-between items-center bg-white border-b border-surface-primary-soft">
								<Text className="text-lg font-semibold text-content-title">
									{title}
								</Text>
								<IconButton
									icon={<XMarkIcon className="w-6 h-6" />}
									onClick={onClose}
									variant="primary"
									size="lg"
									className="relative z-[70] p-2 hover:bg-warning-default/10 rounded-full transition-colors !bg-transparent !text-warning-default !border-0"
									aria-label="Close sidebar"
								/>
							</div>
							<div className="flex-1 overflow-y-auto p-4">{children}</div>
							{footer && (
								<div className="sticky bottom-0 p-4 bg-white border-t border-surface-primary-soft">
									{footer}
								</div>
							)}
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
}
