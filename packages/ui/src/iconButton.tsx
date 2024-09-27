import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import React from "react";

const iconButtonVariants = cva(
	"flex items-center justify-center rounded-lg border font-normal font-inter transition-colors",
	{
		variants: {
			variant: {
				primary: [
					"bg-surface-primary-default text-surface-inverse",
					"hover:bg-surface-primary-soft hover:text-surface-primary-default",
					"focus:ring-2 focus:ring-surface-primary-default focus:ring-opacity-50",
					"disabled:bg-surface-disable disabled:text-surface-border disabled:border-surface-border",
				],
				secondary: [
					"bg-surface-secondary-default text-content-title border-surface-secondary-default",
					"hover:bg-surface-secondary-soft",
					"focus:bg-surface-secondary-focus focus:border-surface-secondary-focus",
					"disabled:bg-surface-disable disabled:text-surface-border disabled:border-surface-border",
				],
			},
			size: {
				xl: "h-16 p-5",
				lg: "h-12 p-3.5",
				md: "h-8 p-1.5",
				sm: "h-6 p-1",
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "md",
		},
	},
);

interface IconButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof iconButtonVariants> {
	icon: ReactNode;
}

function IconButton({
	className,
	variant,
	size,
	icon,
	...props
}: IconButtonProps) {
	return (
		<button
			className={iconButtonVariants({ variant, size, className })}
			{...props}
		>
			{React.cloneElement(icon as React.ReactElement, {
				className:
					size === "xl"
						? "w-6 h-6"
						: size === "lg"
							? "w-5 h-5"
							: size === "md"
								? "w-5 h-5"
								: "w-4 h-4",
			})}
		</button>
	);
}

export default IconButton;
