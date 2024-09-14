import type { ReactNode } from "react";

interface ButtonProps {
	onClick: () => void;
	disabled?: boolean;
	children: ReactNode;
	type?: "button" | "submit" | "reset";
}

export default function Button({
	onClick,
	disabled = false,
	children,
	type = "button",
}: ButtonProps) {
	return (
		<button
			type={type}
			disabled={disabled}
			onClick={onClick}
			className="bg-accent-yellow text-black w-[8.125rem] rounded-xl p-4 font-bold shadow-md"
		>
			{children}
		</button>
	);
}
