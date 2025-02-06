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
}: ProductCardProps) {
	const { t } = useTranslation();

	return (
		<div className="max-w-sm rounded-2xl overflow-hidden shadow-lg border border-surface-border min-w-[22.375rem]">
			<div className="relative">
				<Image
					src={image}
					alt={t("product_image_alt")} // Localized alt text
					width={358}
					height={188}
					className="object-cover w-full h-48 rounded-t-2xl"
				/>
				<div className="absolute bottom-4 left-4">
					<Badge variant="accent" text={badgeText} />
				</div>
			</div>
			<div className="px-4 py-4 bg-surface-primary-soft rounded-b-2xl">
				<Text className="text-sm text-content-body-default">
					{t("region_by_farm", { region, farmName })}{" "}
					{/* Localized region and farm */}
				</Text>

				<div className="flex items-center justify-between">
					<H4 className="text-2xl font-bold text-content-title">{variety}</H4>
					<IconButton
						size="lg"
						variant="secondary"
						onClick={onClick}
						icon={<ArrowRightIcon className="w-5 h-5" />}
					/>
				</div>

				<div className="flex justify-between items-center">
					<Text className="text-xl font-semibold text-surface-primary-default">
						{t("price_with_currency", { price })} {/* Localized price */}
						<span className="text-sm font-semibold"> {t("per_unit")}</span>{" "}
						{/* Localized unit */}
					</Text>
				</div>
			</div>
		</div>
	);
}
