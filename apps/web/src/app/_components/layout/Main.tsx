import SiteHead from "./SiteHead";

interface MainProps {
	children: React.ReactNode;
}

export default function Main({ children }: MainProps) {
	return (
		<>
			{/* <SiteHead /> */}
			<div className="font-roboto h-screen mx-auto  w-full bg-white">
				{children}
			</div>
		</>
	);
}
