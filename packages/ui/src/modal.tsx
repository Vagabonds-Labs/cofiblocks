"use client";

import Button from "@repo/ui/button";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

type ModalProps = {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: ReactNode;
	buttons?: Array<{
		label: string;
		onClick: () => void;
		variant?: "primary" | "secondary";
	}>;
};

function Modal({ isOpen, onClose, title, children, buttons = [] }: ModalProps) {
	if (!isOpen) return null;

	const modalVariants = {
		hidden: { y: "100%", opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: { type: "spring", stiffness: 100 },
		},
		exit: {
			y: "100%",
			opacity: 0,
			transition: { type: "spring", stiffness: 100 },
		},
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end z-50">
			<motion.div
				className="bg-white rounded-t-lg p-6 shadow-xl w-full max-w-md"
				variants={modalVariants}
				initial="hidden"
				animate="visible"
				exit="exit"
			>
				{title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
				<div className="mb-6">{children}</div>
				<div className="space-y-2">
					{buttons.map((button, index) => (
						<Button
							key={`modal-button-${button.label}-${index}`}
							className="w-full"
							onClick={button.onClick}
							variant={button.variant || "primary"}
							size="md"
						>
							{button.label}
						</Button>
					))}
					{buttons.length === 0 && (
						<Button
							className="w-full"
							onClick={onClose}
							variant="secondary"
							size="md"
						>
							Close
						</Button>
					)}
				</div>
			</motion.div>
		</div>
	);
}

export default Modal;
