import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}
interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}
interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

function Card({ className, ...props }: CardProps) {
	return (
		<div
			className={`rounded-lg border border-gray-200 bg-white shadow ${className || ""}`}
			{...props}
		/>
	);
}

function CardHeader({ className, ...props }: CardHeaderProps) {
	return (
		<div
			className={`flex flex-col space-y-1.5 p-6 ${className || ""}`}
			{...props}
		/>
	);
}

function CardTitle({ className, ...props }: CardTitleProps) {
	return (
		<h3
			className={`text-2xl font-semibold leading-none tracking-tight ${className || ""}`}
			{...props}
		/>
	);
}

function CardContent({ className, ...props }: CardContentProps) {
	return <div className={`p-6 pt-0 ${className || ""}`} {...props} />;
}

export { Card, CardHeader, CardTitle, CardContent };
