import cx from "classnames";
import { motion } from "framer-motion";
import { useState } from "react";

type TooltipProps = {
	content: string;
	position?: "top" | "bottom" | "left" | "right";
	children: React.ReactNode;
};

const positionClasses = {
	top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
	bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
	left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
	right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
};

const arrowPositionClasses = {
	top: "bottom-[-0.3125rem] left-1/2 transform -translate-x-1/2 rotate-45",
	bottom: "top-[-0.3125rem] left-1/2 transform -translate-x-1/2 rotate-45",
	left: "right-[-0.3125rem] top-1/2 transform -translate-y-1/2 rotate-45",
	right: "left-[-0.3125rem] top-1/2 transform -translate-y-1/2 rotate-45",
};

function Tooltip({ content, position = "top", children }: TooltipProps) {
	const [isVisible, setIsVisible] = useState(false);

	const showTooltip = () => setIsVisible(true);
	const hideTooltip = () => setIsVisible(false);

	return (
		<div
			className="relative inline-block"
			onMouseEnter={showTooltip}
			onMouseLeave={hideTooltip}
		>
			{children}
			{isVisible && (
				<motion.div
					className={cx(
						"absolute px-2 py-1 text-sm rounded shadow-lg z-10 bg-black text-white",
						positionClasses[position],
					)}
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.8 }}
				>
					{content}
					<div
						className={cx(
							"absolute w-2 h-2 bg-black",
							arrowPositionClasses[position],
						)}
					/>
				</motion.div>
			)}
		</div>
	);
}

export default Tooltip;
