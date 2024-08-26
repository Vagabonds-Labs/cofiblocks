import { type ReactNode } from "react";

interface ButtonProps {
    onClick: () => void;
    disabled?: boolean;
    children: ReactNode;
}

export default function Button({ onClick, disabled = false, children }: ButtonProps) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="bg-primary text-secondary w-[8.125rem] rounded-xl p-4 font-bold shadow-md"
    >
      {children}
    </button>
  );
}