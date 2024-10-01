interface MainProps {
	children: React.ReactNode;
}

export default function Main({ children }: MainProps) {
	return (
		<>
			<div className="font-manrope min-h-screen mx-auto w-full max-w-md bg-white flex items-center justify-center">
				<div className="w-full">{children}</div>
			</div>
		</>
	);
}
