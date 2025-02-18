interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
	orientation?: "horizontal" | "vertical";
}

export function Separator({
	className,
	orientation = "horizontal",
	...props
}: SeparatorProps) {
	return (
		<div
			className={`shrink-0 bg-gray-200 ${
				orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]"
			} ${className || ""}`}
			{...props}
		/>
	);
}
