import { ArrowRightIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { useTranslation } from "~/i18n";
import Badge from "./badge";
import IconButton from "./iconButton";
import { Tooltip } from "./tooltip";
import { H4, Text } from "./typography";

interface ProductCardProps {
	image: string;
	region: string;
	farmName: string;
	variety: string;
	price: number;
	badgeText: string;
	stock: number;
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
	stock,
	onClick,
	onAddToCart,
	isAddingToShoppingCart,
	isConnected,
}: ProductCardProps) {
	const { t } = useTranslation();
	const isSoldOut = stock === 0;

	// Stock level thresholds
	const LOW_STOCK_THRESHOLD = 5;
	const MEDIUM_STOCK_THRESHOLD = 15;

	// Determine stock status and styling
	const getStockStatus = () => {
		if (isSoldOut)
			return { color: "bg-red-500", text: t("stock_status.sold_out") };
		if (stock <= LOW_STOCK_THRESHOLD)
			return {
				color: "bg-orange-500",
				text: t("stock_status.low_stock_left", { count: stock }),
			};
		if (stock <= MEDIUM_STOCK_THRESHOLD)
			return {
				color: "bg-yellow-500",
				text: t("stock_status.stock_available", { count: stock }),
			};
		return {
			color: "bg-green-500",
			text: t("stock_status.in_stock", { count: stock }),
		};
	};

	const stockStatus = getStockStatus();
	const hasLocationInfo = region || farmName;

	return (
		<div className="w-full h-[20rem] md:h-[24rem] lg:h-[28rem] rounded-2xl overflow-hidden shadow-lg border border-surface-border hover:shadow-xl transition-all duration-300 group flex flex-col">
			<div className="relative h-36 md:h-40 lg:h-44">
				<Image
					src={image}
					alt={t("product_image_alt")}
					fill
					className="object-cover rounded-t-2xl transition-transform duration-300 group-hover:scale-105"
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
				/>
				<div className="absolute bottom-3 left-3">
					<Badge variant="accent" text={badgeText} />
				</div>
			</div>
			<div className="flex-1 px-3 py-2.5 md:px-4 md:py-3 lg:px-5 lg:py-4 bg-surface-primary-soft rounded-b-2xl flex flex-col">
				<div className="flex flex-col gap-1 md:gap-1.5 mb-2">
					{hasLocationInfo && (
						<Text className="text-sm md:text-base text-content-body-default">
							{t("region_by_farm", { region, farmName })}
						</Text>
					)}
					<div className="flex items-center">
						<div className={`w-2 h-2 rounded-full ${stockStatus.color} mr-2`} />
						<Text
							className={`text-sm ${isSoldOut ? "text-red-600 font-medium" : "text-gray-600"}`}
						>
							{stockStatus.text}
						</Text>
					</div>
				</div>

				<div className="flex items-start justify-between mb-2 md:mb-3 min-h-[2.75rem] md:min-h-[3rem]">
					<div className="max-w-[90%]">
						<Tooltip content={variety}>
							<H4 className="text-base md:text-lg lg:text-xl font-bold text-content-title line-clamp-2 hover:text-clip cursor-help">
								{variety}
							</H4>
						</Tooltip>
					</div>
					<IconButton
						size="sm"
						variant="secondary"
						onClick={onClick}
						icon={<ArrowRightIcon className="w-5 h-5 md:w-6 md:h-6" />}
						className="ml-2 flex-shrink-0 hover:bg-surface-primary-default hover:text-white transition-colors"
					/>
				</div>

				<div className="mt-auto flex justify-between items-center">
					<Text className="text-base md:text-lg lg:text-xl font-semibold text-surface-primary-default">
						{t("price_with_currency", { price })}
						<span className="text-sm md:text-base font-medium text-content-body-default ml-1">
							{t("per_unit")}
						</span>
					</Text>
					{onAddToCart && isConnected && !isSoldOut && (
						<button
							onClick={onAddToCart}
							disabled={isAddingToShoppingCart}
							className="px-3 py-2 md:px-4 md:py-2 bg-surface-primary-default text-white rounded-lg text-sm font-medium hover:bg-surface-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] md:min-w-[120px] flex items-center justify-center"
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
