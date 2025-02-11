interface SkeletonLoaderProps {
	width?: string;
	height?: string;
	className?: string;
}

function SkeletonLoader({
	width = "w-[19.5rem]",
	height = "h-[44rem]",
	className = "",
}: SkeletonLoaderProps) {
	return (
		<div
			className={`relative rounded-[0.3125rem] ${width} ${height} bg-surface-inverse overflow-hidden ${className}`}
		>
			{/* Rectangle with Content */}
			<div className="w-[16.5rem] h-60 left-6 absolute flex flex-col gap-2">
				<div className="bg-surface-primary-soft rounded-lg h-full w-full animate-pulse" />
				<div className="flex flex-col gap-4">
					<div className="w-[6.75rem] h-4 bg-surface-primary-soft rounded-lg animate-pulse" />
					<div className="h-4 bg-surface-primary-soft rounded-lg w-full animate-pulse" />
					<div className="h-4 bg-surface-primary-soft rounded-lg w-full animate-pulse" />
				</div>
			</div>

			{/* Loading shimmer effect */}
			<div
				className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"
				style={{ backgroundSize: "200% 100%" }}
			/>
		</div>
	);
}

export default SkeletonLoader;
