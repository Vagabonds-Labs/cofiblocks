import Button from "@repo/ui/button";
import type { ReactNode } from "react";

interface SelectableOptionProps {
	icon: ReactNode;
	label: string;
	sublabel?: string;
	isSelected: boolean;
	onClick: () => void;
}

export function SelectableOption({
	icon,
	label,
	sublabel,
	isSelected,
	onClick,
}: Readonly<SelectableOptionProps>) {
	return (
		<Button
			variant="soft"
			size="xl"
			onClick={onClick}
			className="w-full justify-between p-4"
			aria-pressed={isSelected}
		>
			<div className="flex items-center gap-3">
				{icon}
				<div className="text-left">
					<span className="text-base text-content-body-default">{label}</span>
					{sublabel && (
						<p className="text-sm text-content-body-soft">{sublabel}</p>
					)}
				</div>
			</div>
			<div
				className={`w-6 h-6 rounded-full border-2 ${
					isSelected
						? "border-surface-secondary-default bg-surface-secondary-default"
						: "border-surface-border bg-transparent"
				}`}
				aria-hidden="true"
			/>
		</Button>
	);
}
