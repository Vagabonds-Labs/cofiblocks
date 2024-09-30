import cs from "classnames";
import { motion } from "framer-motion";
import { useController } from "react-hook-form";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

type ToggleProps<T extends FieldValues> = {
	name: FieldPath<T>;
	control: Control<T>;
	label: string;
	className?: string;
	disabled?: boolean;
};

function Toggle<T extends FieldValues>({
	name,
	control,
	label,
	className,
	disabled,
}: ToggleProps<T>) {
	const {
		field,
		fieldState: { error },
	} = useController({
		name,
		control,
	});

	const handleChange = () => {
		field.onChange(!field.value);
	};

	const handleKeyPress = (event: React.KeyboardEvent) => {
		if (event.key === "Enter" || event.key === " ") {
			handleChange();
		}
	};

	return (
		<div className={cs("flex items-center gap-2", className)}>
			<div className="relative flex items-center">
				<input
					id={name}
					type="checkbox"
					disabled={disabled}
					{...field}
					checked={!!field.value}
					className="hidden"
				/>
				<motion.div
					className={cs(
						"w-12 h-8 rounded-full flex items-center p-1 cursor-pointer transition-colors border-2",
						{
							"bg-surface-disable border-surface-border":
								!error && !field.value,
							"bg-surface-secondary-soft border-surface-secondary-default":
								!!field.value,
							"bg-error-default border-error-default": error,
						},
					)}
					onClick={handleChange}
					onKeyPress={handleKeyPress}
					tabIndex={0}
					role="switch"
					aria-checked={!!field.value}
					initial={false}
					animate={{
						backgroundColor: field.value ? "#fff1d4" : "#f8fafc",
						borderColor: field.value ? "#ffc222" : "#c7ccd0",
					}}
					transition={{ duration: 0.3 }}
				>
					<motion.div
						className={cs("w-5 h-5 rounded-full shadow-md", {
							"bg-surface-border": !field.value,
							"bg-surface-secondary-default": field.value,
						})}
						layout
						animate={{
							x: field.value ? 14 : 0,
						}}
						transition={{
							type: "spring",
							stiffness: 300,
							damping: 20,
						}}
					/>
				</motion.div>
			</div>
			<label
				htmlFor={name}
				className="text-base font-normal font-inter text-content-body-default cursor-pointer"
				onClick={handleChange}
				onKeyPress={handleKeyPress}
			>
				{label}
			</label>
		</div>
	);
}

export default Toggle;
