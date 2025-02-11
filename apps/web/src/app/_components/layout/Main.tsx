interface MainProps {
	children: React.ReactNode;
}

export default function Main({ children }: MainProps) {
	return (
		<>
			{/* <SiteHead /> */}
			<div className="font-manrope min-h-screen mx-auto w-full bg-white">
				{/* Responsive container with proper breakpoints */}
				<div className="w-full max-w-[100vw] sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto">
					<div className="w-full mb-auto">{children}</div>
				</div>
			</div>
		</>
	);
}
