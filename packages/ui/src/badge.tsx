function Badge({ text }: { text: string }) {
	return (
		<div className="h-6 px-3 py-0.5 bg-content-accent rounded-full justify-center items-center gap-2 inline-flex">
			<div className="text-center text-white text-sm font-normal font-['Inter'] leading-tight font-inter">{text}</div>
		</div>
	);
}

export default Badge;
