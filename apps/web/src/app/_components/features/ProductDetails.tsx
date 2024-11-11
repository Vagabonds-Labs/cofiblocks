import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import Button from "@repo/ui/button";
import { ChatWithSeller } from "@repo/ui/chatWithSeller";
import { DataCard } from "@repo/ui/dataCard";
import PageHeader from "@repo/ui/pageHeader";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProducerInfo } from "./ProducerInfo";
import { SelectionTypeCard } from "./SelectionTypeCard";

interface ProductDetailsProps {
	product: {
		image: string;
		name: string;
		region: string;
		farmName: string;
		roastLevel: string;
		bagsAvailable: number;
		price: number;
		description: string;
		type: "Buyer" | "Farmer" | "SoldOut";
		process: string;
	};
}

export default function ProductDetails({ product }: ProductDetailsProps) {
	const {
		image,
		name,
		region,
		farmName,
		roastLevel,
		bagsAvailable,
		price,
		type,
		description,
		process,
	} = product;
	const [quantity, setQuantity] = useState(1);
	const [isLiked, setIsLiked] = useState(false);
	const router = useRouter();

	const isSoldOut = type === "SoldOut";
	const isFarmer = type === "Farmer";

	return (
		<div className="flex flex-col items-center mx-auto">
			<div className="w-full max-w-[24.375rem]">
				<PageHeader
					title={<div className="truncate text-xl font-bold">{name}</div>}
					showBackButton
					onBackClick={() => router.back()}
					hideCart={false}
					rightActions={
						<button
							type="button"
							onClick={() => setIsLiked(!isLiked)}
							className="p-2"
							aria-label={
								isLiked ? "Remove from favorites" : "Add to favorites"
							}
						>
							{isLiked ? (
								<HeartSolidIcon className="h-6 w-6 text-red-500" />
							) : (
								<HeartIcon className="h-6 w-6" />
							)}
						</button>
					}
				/>
			</div>

			<div className="w-full max-w-[24.375rem]">
				<Image
					src={image}
					alt={name}
					width={358}
					height={358}
					className="object-cover w-full h-full"
				/>
			</div>

			<div className="w-full max-w-[24.375rem] px-4">
				<div>
					<h2 className="text-2xl font-bold mt-6 mx-4 text-left">{name}</h2>
					<p className="text-content-body-default mt-2 mx-4 text-left">
						{product.description}
					</p>
					<div className="mt-6">
						<ChatWithSeller
							name="John Doe"
							description="chat with the seller"
							onClick={() => console.log("Open chat")}
						/>
					</div>
					<div className="grid grid-cols-2 gap-4 mt-6">
						<DataCard
							label="Roast Level"
							value={roastLevel}
							iconSrc="/images/product-details/SandClock.svg"
						/>
						<DataCard
							label="Process"
							value={process}
							iconSrc="/images/product-details/Flame.svg"
						/>
					</div>
					<div className="grid grid-cols-2 gap-4 mt-4">
						<DataCard
							label="Bags Available"
							value={isSoldOut ? "SOLD OUT" : `${bagsAvailable} bags`}
							iconSrc="/images/product-details/Shopping-bag.svg"
							variant={isSoldOut ? "error" : "default"}
						/>
						<DataCard
							label="Unit price (340g)"
							value={isSoldOut ? "SOLD OUT" : `${price} USD`}
							iconSrc="/images/product-details/Discount-2.svg"
							variant={isSoldOut ? "error" : "default"}
						/>
					</div>

					{!isSoldOut && !isFarmer && (
						<div className="mt-6">
							<SelectionTypeCard
								price={price}
								quantity={quantity}
								bagsAvailable={bagsAvailable}
								onQuantityChange={setQuantity}
								onAddToCart={() => void 0}
							/>
						</div>
					)}

					<div className="w-full my-6">
						<div className="flex items-center relative">
							<div className="h-[2px] w-full bg-gradient-to-r from-transparent via-surface-primary-soft to-transparent shadow-sm" />
						</div>
					</div>

					<ProducerInfo
						farmName={farmName}
						rating={4}
						salesCount={125}
						altitude={1680}
						coordinates="15 45 78 90 00 87 45"
						onWebsiteClick={() => void 0}
						isEditable={true}
					/>

					<Button className="w-full mt-1 mb-6" onClick={() => void 0}>
						<div className="text-base font-normal">Edit my farm</div>
					</Button>
				</div>
			</div>
		</div>
	);
}
