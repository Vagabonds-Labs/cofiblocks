import cs from "classnames";
import React from "react";
import { useController } from "react-hook-form";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

type InputFieldProps<T extends FieldValues> = {
	name: FieldPath<T>;
	control: Control<T>;
	label: string;
	description?: string;
	placeholder?: string;
	className?: string;
	inputClassName?: string;
	disabled?: boolean;
};

function InputField<T extends FieldValues>({
	name,
	control,
	label,
	description,
	placeholder,
	className,
	inputClassName,
	disabled,
}: InputFieldProps<T>) {
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
					className="text-[#3c3e3f] text-base font-normal font-['Inter'] leading-normal"
				>
					{label}
				</label>
				{description && (
					<div className="text-right text-[#3c3e3f] text-base font-normal font-['Inter'] leading-normal">
						{description}
					</div>
				)}
			</div>
			<div className={cs("relative", inputClassName)}>
				<input
					id={name}
					type="text"
					className={cs(
						"w-full px-4 py-[13px] bg-white rounded-lg border text-base font-normal font-['Inter'] leading-normal focus:outline-none focus:ring-2 focus:ring-[#ffc222] focus:border-transparent",
						{
							"border-[#d32a1b]": error,
							"border-[#c7ccd0]": !error,
							"text-[#1f1f20]": field.value,
							"text-[#788788]": !field.value,
						},
					)}
					placeholder={placeholder}
					disabled={disabled}
					{...field}
				/>
			</div>
			{error && (
				<div className="text-[#d32a1b] text-base font-normal font-['Inter'] leading-normal">
					{error.message}
				</div>
			)}
		</div>
	);
}

export default InputField;
