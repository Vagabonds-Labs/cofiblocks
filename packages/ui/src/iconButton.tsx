import { type VariantProps, cva } from "class-variance-authority";
import React from "react";
import type { ReactNode } from "react";

const iconButtonVariants = cva(
	"flex items-center justify-center w-10 h-10 rounded-lg gap-2 border-0 font-inter",
	{
		variants: {
			variant: {
				primary: "bg-secondary hover:bg-secondary-light text-black",
				secondary: "bg-primary hover:bg-primary-light text-white",
			},
		},
		defaultVariants: {
			variant: "primary",
		},
	},
);

interface IconButtonProps extends VariantProps<typeof iconButtonVariants> {
	onClick: () => void;
	disabled?: boolean;
	icon: ReactNode;
	type?: "button" | "submit" | "reset";
}

export function IconButton({
	onClick,
	disabled = false,
	icon,
	type = "button",
	variant,
}: IconButtonProps) {
	return (
		<button
			type={type}
			disabled={disabled}
			onClick={onClick}
			className={iconButtonVariants({ variant })}
		>
			{icon}
		</button>
	);
}
