import { useController } from 'react-hook-form';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import cs from 'classnames';

type RadioButtonProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  value: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
};

function RadioButton<T extends FieldValues>({
  name,
  control,
  label,
  value,
  className,
  inputClassName,
  disabled,
}: RadioButtonProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  const handleChange = () => {
    field.onChange(value);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleChange();
    }
  };

  return (
    <div className={cs('flex items-center gap-2', className)}>
      <div className="relative">
        <input
          id={name}
          type="radio"
          disabled={disabled}
          {...field}
          checked={field.value === value}
          className="hidden"
        />
        <div
          className={cs(
            'w-6 h-6 border-2 rounded-full flex justify-center items-center cursor-pointer transition-all',
            {
              'border-surface-border': !error && field.value !== value,
              'border-surface-secondary-default': field.value === value,
              'border-error-default': error,
            }
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
        htmlFor={name} 
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
