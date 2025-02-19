interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
interface CardDescriptionProps
	extends React.HTMLAttributes<HTMLParagraphElement> {}
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
	return (
		<div
			className={`rounded-lg border border-gray-200 bg-white shadow ${className || ""}`}
			{...props}
		/>
	);
}

export function CardHeader({ className, ...props }: CardHeaderProps) {
	return (
		<div
			className={`flex flex-col space-y-1.5 p-6 ${className || ""}`}
			{...props}
		/>
	);
}

export function CardTitle({ className, ...props }: CardTitleProps) {
	return (
		<h3
			className={`text-2xl font-semibold leading-none tracking-tight ${className || ""}`}
			{...props}
		/>
	);
}

export function CardDescription({ className, ...props }: CardDescriptionProps) {
	return (
		<p className={`text-sm text-gray-500 ${className || ""}`} {...props} />
	);
}

export function CardContent({ className, ...props }: CardContentProps) {
	return <div className={`p-6 pt-0 ${className || ""}`} {...props} />;
}

export function CardFooter({ className, ...props }: CardFooterProps) {
	return (
		<div
			className={`flex items-center p-6 pt-0 ${className || ""}`}
			{...props}
		/>
	);
}
