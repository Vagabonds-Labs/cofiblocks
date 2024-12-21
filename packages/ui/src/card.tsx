export function Card({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={`rounded-lg border border-gray-200 bg-white shadow ${className || ""}`}
			{...props}
		/>
	);
}

export function CardHeader({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={`flex flex-col space-y-1.5 p-6 ${className || ""}`}
			{...props}
		/>
	);
}

export function CardTitle({
	className,
	...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
	return (
		<h3
			className={`text-2xl font-semibold leading-none tracking-tight ${className || ""}`}
			{...props}
		/>
	);
}

export function CardDescription({
	className,
	...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
	return (
		<p className={`text-sm text-gray-500 ${className || ""}`} {...props} />
	);
}

export function CardContent({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={`p-6 pt-0 ${className || ""}`} {...props} />;
}

export function CardFooter({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={`flex items-center p-6 pt-0 ${className || ""}`}
			{...props}
		/>
	);
}
