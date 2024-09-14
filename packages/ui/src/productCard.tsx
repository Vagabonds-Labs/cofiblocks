import { ArrowRightIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import IconButton from "./iconButton";
import Badge from "./badge";
import { H4, Text } from "./typography";

interface ProductCardProps {
	image: string;
	title: string;
	price: number;
	available: number;
	onClick: () => void;
	isAddingToShoppingCart: boolean;
}

export function ProductCard({
	image,
	title,
	price,
	available,
	onClick,
	isAddingToShoppingCart,
}: ProductCardProps) {
	return (
		<div className="max-w-sm rounded-2xl overflow-hidden shadow-lg border border-gray-200 min-w-[22.375rem]">
			<div className="relative">
				<Image
					src={image}
					alt="Product Image"
					width={578}
					height={382}
				/>
				<div className="absolute bottom-4 left-4">
					<Badge variant="accent" text={`${available} bags available`} />
				</div>
			</div>
			<div className="h-[102px] px-6 pt-4 pb-6 bg-surface-primary-soft rounded-bl-2xl rounded-br-2xl flex justify-between items-center">
				<div className="flex-col justify-start items-start gap-1 inline-flex">
					<H4>{title}</H4>
					<Text className="self-stretch text-surface-primary-default text-base font-semibold font-inter leading-normal">
						{price} USD
					</Text>
				</div>
				<IconButton
					size="lg"
					variant="secondary"
					onClick={onClick}
					icon={<ArrowRightIcon className="w-5 h-5" />}
				/>
			</div>
		</div>
	);
}
