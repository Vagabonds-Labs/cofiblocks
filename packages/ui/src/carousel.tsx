import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { cva } from "class-variance-authority";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { v4 as uuidv4 } from "uuid";
import CarouselCard, { type CardProps } from "./carouselCard";

interface CarouselProps {
	cards: CardProps[];
}

const carouselButton = cva(
	"absolute top-1/2 transform -translate-y-1/2 bg-surface-inverse/50 hover:bg-surface-inverse/70 backdrop-blur-sm rounded-full p-2 md:p-4 transition-all duration-200 flex items-center justify-center shadow-lg",
	{
		variants: {
			position: {
				left: "left-2 md:left-8",
				right: "right-2 md:right-8",
			},
		},
	},
);

const indicatorButton = cva(
	"w-2 h-2 rounded-full transition-all duration-200",
	{
		variants: {
			active: {
				true: "w-8 bg-surface-secondary-default",
				false: "bg-surface-inverse/50 hover:bg-surface-inverse/70",
			},
		},
	},
);

function Carousel({ cards }: CarouselProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [touchStart, setTouchStart] = useState<number | null>(null);
	const [touchEnd, setTouchEnd] = useState<number | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const carouselRef = useRef<HTMLDivElement>(null);
	const { t } = useTranslation();

	// Minimum swipe distance in pixels
	const minSwipeDistance = 50;

	const nextSlide = () => {
		setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
	};

	const prevSlide = () => {
		setCurrentIndex((prevIndex) =>
			prevIndex === 0 ? cards.length - 1 : prevIndex - 1,
		);
	};

	const goToSlide = (index: number) => {
		setCurrentIndex(index);
	};

	// Auto-advance slides
	useEffect(() => {
		const autoAdvance = () => {
			setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
		};

		const timer = setInterval(autoAdvance, 5000); // Change slide every 5 seconds

		return () => clearInterval(timer);
	}, [cards.length]); // Only depend on cards.length

	const onTouchStart = (e: React.TouchEvent) => {
		setTouchEnd(null);
		const touch = e.targetTouches[0];
		if (touch) {
			setTouchStart(touch.clientX);
		}
	};

	const onTouchMove = (e: React.TouchEvent) => {
		const touch = e.targetTouches[0];
		if (touch) {
			setTouchEnd(touch.clientX);
		}
	};

	const onTouchEnd = () => {
		if (!touchStart || !touchEnd) return;

		const distance = touchStart - touchEnd;
		const isLeftSwipe = distance > minSwipeDistance;
		const isRightSwipe = distance < -minSwipeDistance;

		if (isLeftSwipe) {
			nextSlide();
		} else if (isRightSwipe) {
			prevSlide();
		}
	};

	// Mouse drag support
	const onMouseDown = (e: React.MouseEvent) => {
		setIsDragging(true);
		setTouchStart(e.clientX);
	};

	const onMouseMove = (e: React.MouseEvent) => {
		if (!isDragging) return;
		setTouchEnd(e.clientX);
	};

	const onMouseUp = () => {
		if (!isDragging) return;
		setIsDragging(false);
		onTouchEnd();
	};

	const onMouseLeave = () => {
		if (isDragging) {
			setIsDragging(false);
			onTouchEnd();
		}
	};

	return (
		<div className="w-full relative group">
			<div
				className="relative overflow-hidden touch-pan-y rounded-2xl md:rounded-3xl"
				ref={carouselRef}
				onTouchStart={onTouchStart}
				onTouchMove={onTouchMove}
				onTouchEnd={onTouchEnd}
				onMouseDown={onMouseDown}
				onMouseMove={onMouseMove}
				onMouseUp={onMouseUp}
				onMouseLeave={onMouseLeave}
			>
				<div
					className="flex transition-transform duration-500 ease-out"
					style={{ transform: `translateX(-${currentIndex * 100}%)` }}
				>
					{cards.map((card) => (
						<div key={card.id} className="flex-shrink-0 w-full">
							<CarouselCard {...card} />
						</div>
					))}
				</div>

				{/* Navigation Buttons - Hidden on mobile, visible on hover for desktop */}
				<div className="hidden md:block">
					<button
						onClick={prevSlide}
						type="button"
						className={`${carouselButton({ position: "left" })} opacity-0 group-hover:opacity-100`}
						aria-label={t("previous_slide")}
					>
						<ChevronLeftIcon className="w-6 h-6 md:w-8 md:h-8 text-content-title" />
					</button>
					<button
						onClick={nextSlide}
						type="button"
						className={`${carouselButton({ position: "right" })} opacity-0 group-hover:opacity-100`}
						aria-label={t("next_slide")}
					>
						<ChevronRightIcon className="w-6 h-6 md:w-8 md:h-8 text-content-title" />
					</button>
				</div>
			</div>

			{/* Progress Indicators */}
			<div className="absolute bottom-4 left-0 right-0">
				<div className="flex justify-center items-center space-x-2">
					{cards.map((_, index) => (
						<button
							key={uuidv4()}
							onClick={() => goToSlide(index)}
							className={`${indicatorButton({ active: currentIndex === index })} backdrop-blur-sm`}
							aria-label={t("go_to_slide", { index: index + 1 })}
							type="button"
						/>
					))}
				</div>
			</div>
		</div>
	);
}

export default Carousel;
