import cs from "classnames";
import { useController } from "react-hook-form";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

type TextAreaFieldProps<T extends FieldValues> = {
	name: FieldPath<T>;
	control: Control<T>;
	label: string;
	description?: string;
	placeholder?: string;
	className?: string;
	inputClassName?: string;
	disabled?: boolean;
	rows?: number;
};

function TextAreaField<T extends FieldValues>({
	name,
	control,
	label,
	description,
	placeholder,
	className,
	inputClassName,
	disabled,
	rows = 4,
}: TextAreaFieldProps<T>) {
	const {
		field,
		fieldState: { error },
	} = useController({
		name,
		control,
	});

	return (
		<div className={cs("flex flex-col gap-2 font-inter", className)}>
			<div className="flex justify-between items-center">
				<label
					htmlFor={name}
					className="text-content-body-default text-base font-normal font-['Inter'] leading-normal"
				>
					{label}
				</label>
				{description && (
					<div className="text-right text-content-body-default text-base font-normal font-['Inter'] leading-normal">
						{description}
					</div>
				)}
			</div>
			<div className={cs("relative", inputClassName)}>
				<textarea
					id={name}
					rows={rows}
					className={cs(
						"w-full px-4 py-[13px] bg-surface-inverse rounded-lg border text-base font-normal font-['Inter'] leading-normal focus:outline-none focus:ring-2 focus:ring-surface-secondary-default focus:border-transparent",
						{
							"border-error-default": error,
							"border-surface-border": !error,
							"text-content-title": field.value,
							"text-content-body-soft": !field.value,
						},
					)}
					placeholder={placeholder}
					disabled={disabled}
					{...field}
				/>
			</div>
			{error && (
				<div className="text-error-default text-base font-normal font-['Inter'] leading-normal">
					{error.message}
				</div>
			)}
		</div>
	);
}

export default TextAreaField;
