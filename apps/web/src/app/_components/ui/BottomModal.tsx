import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from 'framer-motion'

type BottomModalProps = {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
	className?: string;
};

function BottomModal({
	isOpen,
	onClose,
	children,
	className,
}: BottomModalProps) {
	const sheetRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				sheetRef.current &&
				!sheetRef.current.contains(event.target as Node)
			) {
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

	if (!isOpen) return null;

  const divContainerVariants = {
    initial: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2, delay: 0.1 } }
  }

	return createPortal(
		<motion.div
		  className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50"
			variants={divContainerVariants}
			initial="initial"
			animate={isOpen ? "visible" : "initial"}
		>
			<div
				className={`bg-white rounded-t-lg w-full max-w-md p-4 max-h-[80vh] overflow-y-auto ${className}`}
				ref={sheetRef}
			>
				{children}
			</div>
		</motion.div>,
		document.body,
	);
}

export default BottomModal;
