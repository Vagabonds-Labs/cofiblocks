import ButtonComponent from "@repo/ui/button";

export interface ButtonProps {
  /** Button contents */
  children: React.ReactNode;
  /** Optional click handler */
  onClick?: () => void;
  /** Is this the principal call to action on the page? */
  variant?: "primary" | "secondary";
  /** Is the button disabled? */
  disabled?: boolean;
  /** Button type */
  type?: "button" | "submit" | "reset";
}

/** Primary UI component for user interaction */
export function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  type = "button",
}: ButtonProps) {
  return (
    <ButtonComponent
      variant={variant}
      disabled={disabled}
      type={type}
      onClick={onClick}
    >
      {children}
    </ButtonComponent>
  );
}
