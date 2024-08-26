import { type ReactNode } from "react";

interface TypographyProps {
  children: ReactNode;
  className?: string;
}

export function H1({ children, className = "" }: TypographyProps) {
  return (
    <h1
      className={`text-primary font-roboto text-4xl font-bold md:text-5xl lg:text-6xl ${className}`}
    >
      {children}
    </h1>
  );
}

export function H2({ children, className = "" }: TypographyProps) {
  return (
    <h2
      className={`text-primary font-roboto text-3xl font-semibold md:text-4xl lg:text-5xl ${className}`}
    >
      {children}
    </h2>
  );
}

export function H3({ children, className = "" }: TypographyProps) {
  return (
    <h3
      className={`text-primary font-roboto text-2xl font-medium md:text-3xl lg:text-4xl ${className}`}
    >
      {children}
    </h3>
  );
}

export function Subtitle({ children, className = "" }: TypographyProps) {
  return (
    <p
      className={`text-primary font-roboto text-xl font-light md:text-2xl ${className}`}
    >
      {children}
    </p>
  );
}

export function Label({ children, className = "" }: TypographyProps) {
  return (
    <span
      className={`text-primary font-roboto text-sm font-normal md:text-base ${className}`}
    >
      {children}
    </span>
  );
}
