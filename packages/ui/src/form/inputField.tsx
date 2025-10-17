import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import cs from "classnames";
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
	onChange?: (value: string) => void;
	showSearchIcon?: boolean;
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
	onChange,
	showSearchIcon = false,
}: InputFieldProps<T>) {
	const {
		field,
		fieldState: { error },
	} = useController({
		name,
		control,
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		field.onChange(e);
		if (onChange) {
			onChange(e.target.value);
		}
	};

	return (
		<div className={cs("flex flex-col font-inter", className)}>
			<div className="flex justify-between items-center">
				<label
					htmlFor={name}
					className="text-content-body-default text-base font-normal leading-normal"
				>
					{label}
				</label>
				{description && (
					<div className="text-right text-content-body-default text-base font-normal leading-normal">
						{description}
					</div>
				)}
			</div>
			<div className={cs("relative", inputClassName)}>
				{showSearchIcon && (
					<div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
						<MagnifyingGlassIcon className="h-5 w-5" />
					</div>
				)}
				<input
					{...field}
					id={name}
					type="text"
					className={cs(
						"w-full px-4 py-[13px] bg-surface-inverse rounded-lg border text-base font-normal leading-normal focus:outline-none focus:ring-2 focus:ring-surface-secondary-default focus:border-transparent",
						{
							"pl-10 pr-4": showSearchIcon,
							"px-4": !showSearchIcon,
							"border-error-default": error,
							"border-surface-border": !error,
							"text-content-title": field.value,
							"text-content-body-soft": !field.value,
						},
						"py-[13px]",
					)}
					placeholder={placeholder}
					disabled={disabled}
					value={field.value || ""}
					onChange={handleChange}
				/>
			</div>
			{error && (
				<div className="text-error-default text-base font-normal leading-normal">
					{error.message}
				</div>
			)}
		</div>
	);
}

export default InputField;
