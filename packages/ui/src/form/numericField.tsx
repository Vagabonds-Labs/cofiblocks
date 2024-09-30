import cs from "classnames";
import React from "react";
import { useController } from "react-hook-form";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

type NumericFieldProps<T extends FieldValues> = {
	name: FieldPath<T>;
	control: Control<T>;
	label: string;
	min?: number;
	max?: number;
	step?: number;
	className?: string;
	inputClassName?: string;
	disabled?: boolean;
};

function NumericField<T extends FieldValues>({
	name,
	control,
	label,
	min = 1,
	max = 100,
	step = 1,
	className,
	inputClassName,
	disabled,
}: NumericFieldProps<T>) {
	const {
		field,
		fieldState: { error },
	} = useController({
		name,
		control,
	});

	const handleIncrement = () => {
		if (field.value < max) {
			field.onChange(field.value + step);
		}
	};

	const handleDecrement = () => {
		if (field.value > min) {
			field.onChange(field.value - step);
		}
	};

	return (
		<div className={cs("flex flex-col gap-2 font-inter", className)}>
			<label
				htmlFor={name}
				className="text-content-body-default text-base font-normal font-['Inter'] leading-normal"
			>
				{label}
			</label>
			<div
				className={cs(
					"h-[52px] px-4 py-[13px] bg-surface-inverse rounded-lg border justify-between items-center inline-flex",
					inputClassName,
					{ "border-error-default": error, "border-surface-border": !error },
				)}
			>
				<div className="w-6 h-6 relative">
					<button
						type="button"
						onClick={handleDecrement}
						disabled={disabled || field.value <= min}
						className={cs(
							"w-6 h-6 flex items-center justify-center rounded-lg bg-surface-secondary-default text-surface-inverse",
							{
								"opacity-50 cursor-not-allowed": disabled || field.value <= min,
								"hover:bg-surface-secondary-focus": !disabled,
							},
						)}
					>
						–
					</button>
				</div>
				<div className="text-content-title text-base font-normal font-['Inter'] leading-normal">
					{field.value}
				</div>
				<div className="w-6 h-6 relative">
					<button
						type="button"
						onClick={handleIncrement}
						disabled={disabled || field.value >= max}
						className={cs(
							"w-6 h-6 flex items-center justify-center rounded-lg bg-surface-secondary-default text-surface-inverse",
							{
								"opacity-50 cursor-not-allowed": disabled || field.value >= max,
								"hover:bg-surface-secondary-focus": !disabled,
							},
						)}
					>
						+
					</button>
				</div>
			</div>
			{error && (
				<div className="text-error-default text-base font-normal font-['Inter'] leading-normal">
					{error.message}
				</div>
			)}
		</div>
	);
}

export default NumericField;
