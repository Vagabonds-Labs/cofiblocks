import { ArrowRightIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import Badge from "./badge";
import IconButton from "./iconButton";
import { H4, Text } from "./typography";

interface ProductCardProps {
	image: string;
	region: string;
	farmName: string;
	variety: string;
	price: number;
	badgeText: string;
	onClick: () => void;
	onAddToCart?: () => void;
	isAddingToShoppingCart?: boolean;
	isConnected?: boolean;
}

export function ProductCard({
	image,
	region,
	farmName,
	variety,
	price,
	badgeText,
	onClick,
	onAddToCart,
	isAddingToShoppingCart,
	isConnected,
}: ProductCardProps) {
	const { t } = useTranslation();

	return (
		<div className="w-full rounded-2xl overflow-hidden shadow-lg border border-surface-border hover:shadow-xl transition-all duration-300 group">
			<div className="relative">
				<Image
					src={image}
					alt={t("product_image_alt")}
					width={600}
					height={400}
					className="object-cover w-full h-48 md:h-64 lg:h-72 rounded-t-2xl transition-transform duration-300 group-hover:scale-105"
				/>
				<div className="absolute bottom-4 left-4">
					<Badge variant="accent" text={badgeText} />
				</div>
			</div>
			<div className="px-4 py-4 md:px-6 md:py-6 bg-surface-primary-soft rounded-b-2xl">
				<Text className="text-sm md:text-base text-content-body-default mb-2">
					{t("region_by_farm", { region, farmName })}
				</Text>

				<div className="flex items-center justify-between mb-4">
					<H4 className="text-xl md:text-2xl lg:text-3xl font-bold text-content-title line-clamp-2">
						{variety}
					</H4>
					<IconButton
						size="lg"
						variant="secondary"
						onClick={onClick}
						icon={<ArrowRightIcon className="w-5 h-5 md:w-6 md:h-6" />}
						className="ml-2 flex-shrink-0 hover:bg-surface-primary-default hover:text-white transition-colors"
					/>
				</div>

				<div className="flex justify-between items-center">
					<Text className="text-lg md:text-xl lg:text-2xl font-semibold text-surface-primary-default">
						{t("price_with_currency", { price })}
						<span className="text-sm md:text-base font-medium text-content-body-default ml-1">
							{t("per_unit")}
						</span>
					</Text>
					{onAddToCart && isConnected && (
						<button
							onClick={onAddToCart}
							disabled={isAddingToShoppingCart}
							className="px-4 py-2 md:px-6 md:py-3 bg-surface-primary-default text-white rounded-lg text-sm md:text-base font-medium hover:bg-surface-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] md:min-w-[140px] flex items-center justify-center"
							type="button"
						>
							{isAddingToShoppingCart ? (
								<>
									<svg
										className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										aria-label="Loading spinner"
										role="img"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										/>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										/>
									</svg>
									{t("adding_to_cart")}
								</>
							) : (
								t("add_to_cart")
							)}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
