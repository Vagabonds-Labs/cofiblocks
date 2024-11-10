import Image from "next/image";
import Button from "./button";
import { Text } from "./typography";

interface Option {
	label: string;
	iconSrc?: string;
	selected?: boolean;
	onClick?: () => void;
}

interface InfoCardProps {
	title: string;
	options: Option[];
	children?: React.ReactNode;
}

export function InfoCard({ title, options, children }: InfoCardProps) {
	return (
		<div className="w-full bg-surface-primary-soft rounded-lg">
			<div className="p-6 flex flex-col gap-4">
				<Text className="text-base font-semibold text-content-title">
					{title}
				</Text>

				<div className="flex flex-col gap-4">
					{options.map((option) => (
						<div
							key={option.label}
							className="p-6 bg-white rounded-lg flex items-center gap-4 cursor-pointer"
							onClick={option.onClick}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									option.onClick?.();
								}
							}}
							role="button"
							tabIndex={0}
						>
							<div className="w-6 h-6 relative">
								<Image
									src={option.iconSrc ?? "/images/product-details/Menu-4.svg"}
									alt={option.label}
									width={24}
									height={24}
									className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
								/>
							</div>
							<div className="flex-1">
								<Text className="text-base font-semibold text-content-title">
									{option.label}
								</Text>
							</div>
							<div
								className={`rounded-full border border-surface-border ${
									option.selected
										? "w-5 h-5 bg-surface-primary-default"
										: "w-4 h-4 bg-white"
								}`}
							/>
						</div>
					))}
				</div>

				{children}
			</div>
		</div>
	);
}
