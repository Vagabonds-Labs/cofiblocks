import Image from "next/image";

interface DataCardProps {
	label: string;
	value: string;
	iconSrc?: string;
	variant?: "default" | "error";
}

export function DataCard({
	label,
	value,
	iconSrc = "/images/placeholder.svg",
	variant = "default",
}: DataCardProps) {
	return (
		<div className="w-full h-full p-6 bg-surface-primary-soft rounded-lg flex flex-col justify-between items-start">
			<div className="relative w-8 h-8">
				<Image
					src={iconSrc}
					alt="icon"
					width={24}
					height={24}
					className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
				/>
			</div>
			<div className="w-full flex flex-col gap-1">
				<span className="text-content-body-default text-sm">{label}</span>
				<span
					className={`text-base font-semibold ${
						variant === "error" ? "text-error-default" : "text-content-title"
					}`}
				>
					{value}
				</span>
			</div>
		</div>
	);
}
