function Pill({ text }: { text: string }) {
	return (
		<div className="bg-accent text-white text-sm font-normal font-inter py-1 px-4 rounded-full leading-5 text-center inline-block">
			{text}
		</div>
	);
}

export default Pill;
