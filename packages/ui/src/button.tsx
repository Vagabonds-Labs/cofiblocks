import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  "flex items-center justify-center rounded-lg border font-medium transition-all duration-200",
  {
    variants: {
      variant: {
        primary: [
          "bg-surface-secondary-default text-content-title border-surface-secondary-default",
          "hover:bg-surface-secondary-focus hover:border-surface-secondary-focus",
          "focus:ring-2 focus:ring-surface-secondary-default focus:ring-opacity-50",
          "disabled:bg-surface-disable disabled:text-surface-border disabled:border-surface-border",
        ],
        secondary: [
          "bg-surface-secondary-soft text-content-title border-surface-secondary-soft",
          "hover:bg-surface-secondary-soft-focus hover:border-surface-secondary-soft-focus",
          "focus:ring-2 focus:ring-surface-secondary-soft focus:ring-opacity-50",
          "disabled:bg-surface-disable disabled:text-surface-border disabled:border-surface-border",
        ],
      },
      size: {
        xl: "h-16 px-8 py-4 text-base",
        lg: "h-12 px-6 py-3 text-base",
        md: "h-10 px-4 py-2 text-base",
        sm: "h-8 px-3 py-1 text-sm",
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
    VariantProps<typeof buttonVariants> {
  icon?: ReactNode;
}

function Button({
  className,
  variant,
  size,
  icon,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}

export default Button;
