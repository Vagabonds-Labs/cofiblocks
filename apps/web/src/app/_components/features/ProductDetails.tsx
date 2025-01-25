import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import Button from "@repo/ui/button";
import { DataCard } from "@repo/ui/dataCard";
import PageHeader from "@repo/ui/pageHeader";
import { useAtom, useAtomValue } from "jotai";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { addItemAtom, cartItemsAtom } from "~/store/cartAtom";
import { ProducerInfo } from "./ProducerInfo";
import { SelectionTypeCard } from "./SelectionTypeCard";

interface ProductDetailsProps {
	product: {
		id: number;
		tokenId: number;
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
		farmName,
		roastLevel,
		bagsAvailable,
		price,
		type,
		process,
	} = product;
	const { t } = useTranslation();
	const [quantity, setQuantity] = useState(1);
	const [isLiked, setIsLiked] = useState(false);
	const router = useRouter();
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const [, addItem] = useAtom(addItemAtom);
	const items = useAtomValue(cartItemsAtom);
	const cartItemsCount = items.reduce(
		(total, item) => total + item.quantity,
		0,
	);

	const isSoldOut = type === "SoldOut";
	const isFarmer = type === "Farmer";

	const handleAddToCart = () => {
		setIsAddingToCart(true);
		addItem({
			id: String(product.id),
			tokenId: product.tokenId,
			name: product.name,
			quantity: quantity,
			price: product.price,
			imageUrl: product.image,
		});
		setIsAddingToCart(false);
	};

	return (
		<div className="mx-auto flex flex-col items-center">
			<div className="w-full max-w-[24.375rem]">
				<PageHeader
					title={
						<div className="truncate text-xl font-bold">{t(product.name)}</div>
					}
					showBackButton
					onBackClick={() => router.back()}
					showCart={true}
					cartItemsCount={cartItemsCount}
					rightActions={
						<button
							type="button"
							onClick={() => setIsLiked(!isLiked)}
							className="p-2"
							aria-label={
								isLiked ? t("remove_from_favorites") : t("add_to_favorites")
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
					className="h-full w-full object-cover"
				/>
			</div>

			<div className="w-full max-w-[24.375rem] px-4">
				<div>
					<h2 className="mx-4 mt-6 text-left text-2xl font-bold">
						{t(product.name)}
					</h2>
					<p className="mx-4 mt-2 text-left text-content-body-default">
						{t(product.description)}
					</p>
					<div className="mt-6 grid grid-cols-2 gap-4">
						<DataCard
							label={t("roast_level")}
							value={t(`strength.${roastLevel.toLowerCase()}`)}
							iconSrc="/images/product-details/SandClock.svg"
						/>
						<DataCard
							label={t("process")}
							value={t(`processes.${process.toLowerCase()}`)}
							iconSrc="/images/product-details/Flame.svg"
						/>
					</div>
					<div className="mt-4 grid grid-cols-2 gap-4">
						<DataCard
							label={t("bags_available")}
							value={
								isSoldOut ? t("sold_out") : `${bagsAvailable} ${t("bags")}`
							}
							iconSrc="/images/product-details/Shopping-bag.svg"
							variant={isSoldOut ? "error" : "default"}
						/>
						<DataCard
							label={t("unit_price", { weight: "340g" })}
							value={isSoldOut ? t("sold_out") : `${price} USD`}
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
								onAddToCart={handleAddToCart}
								isAddingToCart={isAddingToCart}
							/>
						</div>
					)}

					<div className="my-6 w-full">
						<div className="relative flex items-center">
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

					<Button className="mb-6 mt-1 w-full" onClick={() => void 0}>
						<div className="text-base font-normal">{t("edit_my_farm")}</div>
					</Button>
				</div>
			</div>
		</div>
	);
}
