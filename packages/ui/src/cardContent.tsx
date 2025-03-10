import React, { type ReactNode } from "react";

interface CardContentProps {
	className?: string;
	children: ReactNode;
}

export function CardContent({ className = "", children }: CardContentProps) {
	return <div className={`p-6 ${className}`}>{children}</div>;
}
