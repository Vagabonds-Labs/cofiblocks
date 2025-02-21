import { ArrowRightIcon } from "@heroicons/react/24/solid";
import Button from "@repo/ui/button";
import { useTranslation } from "react-i18next";

interface NFTMetadata {
	imageSrc: string;
}

interface NFTCardProps {
	title: string;
	nftMetadata: NFTMetadata;
	onDetailsClick?: () => void;
	quantity?: number;
}

function NFTCard({
	title,
	nftMetadata,
	onDetailsClick,
	quantity,
}: NFTCardProps) {
	const { t } = useTranslation();
	return (
		<div className="bg-surface-primary-soft rounded-[1rem] shadow-md flex overflow-hidden">
			<img
				src={nftMetadata.imageSrc}
				alt={title}
				className="w-36 h-[11.75rem] object-cover"
			/>
			<div className="flex flex-col items-start justify-center flex-1 p-4 ml-4">
				<h2 className="text-content-title font-manrope text-2xl font-bold mb-2">
					{title}
				</h2>
				{quantity && (
					<p className="text-content-secondary mb-4">
						{t("quantity")}: {quantity}
					</p>
				)}
				<Button
					variant="secondary"
					size="sm"
					onClick={onDetailsClick}
					className="flex items-center gap-2"
				>
					{t("details")}
					<ArrowRightIcon className="h-5 w-5" />
				</Button>
			</div>
		</div>
	);
}

export default NFTCard;
