import cs from "classnames";
import cn from "classnames";
import { useController } from "react-hook-form";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

type RadioButtonProps<T extends FieldValues> = {
	name: FieldPath<T>;
	control: Control<T>;
	label: string;
	value: string;
	className?: string;
	inputClassName?: string;
	disabled?: boolean;
	id?: string;
};

function RadioButton<T extends FieldValues>({
	name,
	control,
	label,
	value,
	className,
	inputClassName,
	disabled,
	id,
}: RadioButtonProps<T>) {
	const {
		field,
		fieldState: { error },
	} = useController({
		name,
		control,
	});

	const inputId = id ?? `${name}-${value}`;

	const handleChange = () => {
		field.onChange(value);
	};

	const handleKeyPress = (event: React.KeyboardEvent) => {
		if (event.key === "Enter" || event.key === " ") {
			handleChange();
		}
	};

	return (
		<div className={cs("flex items-center gap-2", className)}>
			<div className="relative">
				<input
					type="radio"
					id={inputId}
					name={name}
					checked={field.value === value}
					onChange={handleChange}
					onKeyPress={handleKeyPress}
					aria-checked={field.value === value}
					className={cn(
						"h-5 w-5 cursor-pointer rounded-full border border-surface-border bg-white",
						field.value === value && "bg-surface-primary-default",
					)}
				/>
				<div
					className={cs(
						"w-6 h-6 border-2 rounded-full flex justify-center items-center cursor-pointer transition-all",
						{
							"border-surface-border": !error && field.value !== value,
							"border-surface-secondary-default": field.value === value,
							"border-error-default": error,
						},
					)}
					onClick={handleChange}
					onKeyPress={handleKeyPress}
					tabIndex={0}
					role="radio"
					aria-checked={field.value === value}
				>
					{field.value === value && (
						<div className="w-3 h-3 bg-surface-secondary-default rounded-full" />
					)}
				</div>
			</div>
			<label
				htmlFor={inputId}
				className="text-base font-normal font-['Inter'] text-content-body-default cursor-pointer"
				onClick={handleChange}
				onKeyPress={handleKeyPress}
			>
				{label}
			</label>
		</div>
	);
}

export default RadioButton;
