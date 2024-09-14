import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  "rounded-full justify-center items-center gap-2 inline-flex",
  {
    variants: {
      variant: {
        default: "bg-slate-50 text-content-body-default",
        primary: "bg-surface-primary-default text-surface-inverse",
        secondary: "bg-surface-secondary-default text-content-body-default",
        accent: "bg-content-accent text-surface-inverse",
        success: "bg-success-default text-surface-inverse",
      },
      size: {
        sm: "px-2 text-xs leading-none",
        md: "px-3 py-0.5 text-sm leading-tight",
        lg: "px-4 py-0.5 text-base leading-normal",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  text: string;
}

function Badge({ text, variant, size }: BadgeProps) {
  return (
    <div className={badgeVariants({ variant, size })}>
      <div className="text-center font-normal font-inter">{text}</div>
    </div>
  );
}

export default Badge;
