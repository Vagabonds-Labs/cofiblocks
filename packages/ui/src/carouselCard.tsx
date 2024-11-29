import { useTranslation } from "react-i18next";
import Badge from "./badge";

export interface CardProps {
	tag: string;
	title: string;
	id: string;
	image: string;
}

function CarouselCard({ tag, title, image }: CardProps) {
	const { t } = useTranslation();

	return (
		<div
			className="w-[23.875rem] h-[12.0625rem] px-6 py-4 bg-gradient-to-t from-black to-transparent flex flex-col justify-end items-start gap-2.5"
			style={{
				backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${image})`,
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
			}}
		>
			<div className="h-[3.875rem] flex flex-col justify-start items-start gap-2">
				<Badge text={t(tag)} variant="accent" size="md" />
				<div className="max-w-full text-white text-2xl font-bold font-manrope leading-[2.125rem] line-clamp-2">
					{t(title)}
				</div>
			</div>
		</div>
	);
}

export default CarouselCard;
