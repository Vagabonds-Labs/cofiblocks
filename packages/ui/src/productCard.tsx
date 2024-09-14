import { ArrowRightIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { IconButton } from "./iconButton";
import Pill from "./pill";
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
					className="object-cover"
					src={image}
					alt="Product Image"
					width={300}
					height={192}
				/>
				<div className="absolute bottom-4 left-4">
					<Pill text={`${available} bags available`} />
				</div>
			</div>
			<div className="p-4 bg-primary-light">
				<H4 className="text-lg font-bold text-gray-900 mb-1">{title}</H4>
				<Text className="text-lg mb-2 text-primary font-bold">
					{price} USD <span className="font-normal text-sm">/unit</span>
				</Text>
				<div className="flex justify-end">
					<IconButton
						variant="primary"
						onClick={onClick}
						icon={<ArrowRightIcon className="h-5 w-5 text-black" />}
					/>
				</div>
			</div>
		</div>
	);
}
