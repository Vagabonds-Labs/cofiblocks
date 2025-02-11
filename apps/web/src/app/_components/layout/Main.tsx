interface MainProps {
	children: React.ReactNode;
	fullWidth?: boolean;
	className?: string;
}

export default function Main({
	children,
	fullWidth = false,
	className = "",
}: MainProps) {
	return (
		<div className={`min-h-screen w-full bg-white ${className}`}>
			{fullWidth ? (
				<div className="w-full">{children}</div>
			) : (
				<div className="w-full px-4 md:px-6 lg:px-8">
					<div className="w-full max-w-7xl mx-auto">{children}</div>
				</div>
			)}
		</div>
	);
}
