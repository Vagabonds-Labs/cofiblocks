import type { ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  "flex items-center justify-center rounded-lg border font-normal font-inter transition-colors",
  {
    variants: {
      variant: {
        primary: [
          "bg-content-surface-primary-default text-content-surface-inverse",
          "hover:bg-content-surface-primary-soft hover:text-content-surface-primary-default",
          "focus:ring-2 focus:ring-content-surface-primary-default focus:ring-opacity-50",
          "disabled:bg-content-surface-disable disabled:text-content-surface-border disabled:border-content-surface-border",
        ],
        secondary: [
          "bg-content-surface-secondary-default text-content-title border-content-surface-secondary-default",
          "hover:bg-content-surface-secondary-soft",
          "focus:bg-content-surface-secondary-focus focus:border-content-surface-secondary-focus",
          "disabled:bg-content-surface-disable disabled:text-content-surface-border disabled:border-content-surface-border",
        ],
      },
      size: {
        xl: "h-16 px-6 py-5 text-base leading-normal",
        lg: "h-[3.25rem] px-4 py-3.5 text-base leading-normal",
        md: "h-9 px-3 py-1.5 text-base leading-normal",
        sm: "h-7 px-2 py-1 text-sm leading-tight",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

function Button({
  className,
  variant,
  size,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  );
}

export default Button;
