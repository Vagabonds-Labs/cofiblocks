import Image from "next/image";
import { H2, Text } from "./typography";

export interface CardProps {
	id: string;
	tag: string;
	title: string;
	image: string;
}

function CarouselCard({ tag, title, image }: CardProps) {
	return (
		<div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden">
			{/* Background Image */}
			<Image
				src={image}
				alt={title}
				fill
				className="object-cover"
				sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
				priority
			/>

			{/* Gradient Overlay */}
			<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

			{/* Content */}
			<div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 flex flex-col items-start">
				<Text className="inline-block px-3 py-1 mb-3 bg-surface-inverse/80 backdrop-blur-sm rounded-full text-sm font-medium text-content-title">
					{tag}
				</Text>
				<H2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white max-w-2xl">
					{title}
				</H2>
			</div>
		</div>
	);
}

export default CarouselCard;
