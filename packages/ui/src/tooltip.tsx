"use client";

import { type ReactNode, useState } from "react";

interface TooltipProps {
	children: ReactNode;
	content: string;
	position?: "top" | "bottom" | "left" | "right";
}

const positionStyles = {
	top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
	bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
	left: "right-full top-1/2 -translate-y-1/2 mr-2",
	right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

export function Tooltip({
	children,
	content,
	position = "bottom",
}: TooltipProps) {
	const [isVisible, setIsVisible] = useState(false);

	return (
		<div
			className="relative inline-block"
			onMouseEnter={() => setIsVisible(true)}
			onMouseLeave={() => setIsVisible(false)}
			onFocus={() => setIsVisible(true)}
			onBlur={() => setIsVisible(false)}
		>
			{children}
			{isVisible && (
				<div
					role="tooltip"
					className={`
						absolute z-50 px-2 py-1 text-xs
						bg-surface-inverse text-surface-inverse-soft
						rounded-md shadow-lg whitespace-nowrap
						transition-opacity duration-200
						${positionStyles[position]}
					`}
				>
					{content}
				</div>
			)}
		</div>
	);
}
