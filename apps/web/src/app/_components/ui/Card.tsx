import Image from "next/image";
import React from "react";
import Button from "./Button";
import Spinner from "./Spinner";
import { Subtitle } from "./Typography";

interface CardProps {
	title: string;
	description: string;
	imageUrl: string;
	imageAlt?: string;
	price: string;
	className?: string;
	productId: string;
	onClick?: (productId: number) => void;
	isAddingToShoppingCart?: boolean;
}

export default function Card({
	title,
	description,
	imageUrl,
	imageAlt = "Product image",
	price,
	productId,
	className = "",
	onClick = () => {},
	isAddingToShoppingCart = false,
}: CardProps) {
	const handleClick = React.useCallback(() => {
		onClick(Number(productId));
	}, [onClick, productId]);

	return (
		<div
			className={`card card-compact bg-base-100 shadow-xl transition-shadow hover:shadow-2xl ${className}`}
		>
			<figure className="relative aspect-[4/3] overflow-hidden">
				<Image
					src={imageUrl}
					alt={imageAlt}
					fill
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					className="object-cover transition-transform duration-300 ease-in-out hover:scale-105"
				/>
			</figure>
			<div className="card-body">
				<Subtitle as="h3" className="card-title line-clamp-1">
					{title}
				</Subtitle>
				<p className="line-clamp-2 text-sm text-gray-600">{description}</p>
				<div className="mt-4 flex items-center justify-between">
					<div className="text-lg font-bold text-primary">${price}</div>
					<Button
						disabled={isAddingToShoppingCart}
						onClick={handleClick}
						aria-label={
							isAddingToShoppingCart ? "Adding to cart" : "Add to cart"
						}
					>
						{isAddingToShoppingCart ? (
							<div className="flex items-center gap-2">
								<Spinner className="h-4 w-4" />
								<span>Adding</span>
							</div>
						) : (
							"Add to cart"
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}
