import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { cva } from "class-variance-authority";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "~/i18n";
import CarouselCard, { type CardProps } from "./carouselCard";

interface CarouselProps {
	cards: CardProps[];
}

const carouselButton = cva(
	"absolute top-1/2 transform -translate-y-1/2 bg-surface-inverse bg-opacity-50 rounded-full p-1",
	{
		variants: {
			position: {
				left: "left-5",
				right: "right-5",
			},
		},
	},
);

const indicatorButton = cva(
	"w-2 h-2 rounded-full transition-colors duration-200",
	{
		variants: {
			active: {
				true: "bg-surface-secondary-default",
				false: "border border-surface-secondary-default",
			},
		},
	},
);

function Carousel({ cards }: CarouselProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const { t } = useTranslation();

	const nextSlide = () => {
		setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
	};

	const prevSlide = () => {
		setCurrentIndex(
			(prevIndex) => (prevIndex - 1 + cards.length) % cards.length,
		);
	};

	const goToSlide = (index: number) => {
		setCurrentIndex(index);
	};

	return (
		<div className="w-full px-4">
			<div className="relative overflow-hidden">
				<div
					className="flex transition-transform duration-300 ease-in-out"
					style={{ transform: `translateX(-${currentIndex * 100}%)` }}
				>
					{cards.map((card) => (
						<div
							key={card.id}
							className="flex-shrink-0 w-full flex justify-center items-center"
						>
							<CarouselCard {...card} />
						</div>
					))}
				</div>
				<button
					onClick={prevSlide}
					type="button"
					className={carouselButton({ position: "left" })}
				>
					<ChevronLeftIcon className="w-4 h-4 text-content-title" />
				</button>
				<button
					onClick={nextSlide}
					type="button"
					className={carouselButton({ position: "right" })}
				>
					<ChevronRightIcon className="w-4 h-4 text-content-title" />
				</button>
			</div>

			<div className="flex justify-center space-x-2 mt-4">
				{cards.map((_, index) => (
					<button
						key={uuidv4()}
						onClick={() => goToSlide(index)}
						className={indicatorButton({ active: currentIndex === index })}
						aria-label={t("go_to_slide", { index: index + 1 })}
						type="button"
					/>
				))}
			</div>
		</div>
	);
}

export default Carousel;
