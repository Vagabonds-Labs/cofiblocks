import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FarmModal } from "./FarmModal";

interface ProducerInfoProps {
	farmName: string;
	rating: number;
	salesCount: number;
	altitude: number;
	coordinates: string;
	onWebsiteClick: () => void;
	farmSince?: string;
	farmBio?: string;
	farmExperiences?: string;
	farmGoodPractices?: string;
	isEditable?: boolean;
}

export function ProducerInfo({
	farmName,
	rating = 4,
	salesCount,
	altitude,
	coordinates,
	onWebsiteClick,
	farmSince,
	farmBio,
	farmExperiences,
	farmGoodPractices,
	isEditable = false,
}: ProducerInfoProps) {
	const [isFarmModalOpen, setIsFarmModalOpen] = useState(false);
	const router = useRouter();
	const { t } = useTranslation();

	const farmData = {
		name: farmName,
		since: farmSince ?? "2020",
		bio: farmBio ?? t("farm_bio_placeholder"),
		experiences: farmExperiences ?? t("farm_experiences_placeholder"),
		goodPractices: farmGoodPractices ?? t("farm_good_practices_placeholder"),
	};

	// const _openFarmModal = () => setIsFarmModalOpen(true);
	const closeFarmModal = () => setIsFarmModalOpen(false);

	return (
		<div className="flex flex-col items-center mt-6">
			<div className="w-24 h-24 relative mb-6">
				<Image
					src="/images/farm-cafe-las-penas.jpg"
					alt={t("producer_avatar_alt")}
					fill
					className="object-contain"
				/>
			</div>
			<h2 className="text-2xl font-bold text-content-title mb-6">
				{t("about_the_producer")}
			</h2>

			<div
				className="w-full px-4 py-3 bg-white rounded-lg flex justify-between items-center cursor-pointer"
				role="button"
				tabIndex={0}
			>
				<div className="flex items-center gap-4">
					<div className="w-6 h-6 relative">
						<Image
							src="/images/product-details/producer-info/farm.svg"
							alt={t("farm_icon_alt")}
							width={24}
							height={24}
							className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
						/>
					</div>
					<span className="text-base font-semibold text-content-title">
						{t("farm")}
					</span>
				</div>
				<div className="flex items-center gap-4">
					<span className="text-base text-content-title">{farmName}</span>
				</div>
			</div>

			<div className="w-full px-4 py-3 bg-white rounded-lg flex justify-between items-center">
				<div className="flex items-center gap-4">
					<div className="w-6 h-6 relative">
						<Image
							src="/images/product-details/producer-info/Star.svg"
							alt={t("reviews_icon_alt")}
							width={24}
							height={24}
							className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
						/>
					</div>
					<span className="text-base font-semibold text-content-title">
						{t("reviews")}
					</span>
				</div>
				<div className="flex items-center gap-2">
					{[1, 2, 3, 4, 5].map((starIndex) => (
						<Image
							key={starIndex}
							src={
								starIndex <= rating
									? "/images/product-details/producer-info/Star-highlighted.svg"
									: "/images/product-details/producer-info/Star.svg"
							}
							alt={t("star_icon_alt", { starIndex })}
							width={24}
							height={24}
						/>
					))}
				</div>
			</div>

			<div className="w-full px-4 py-3 bg-white rounded-lg flex justify-between items-center">
				<div className="flex items-center gap-4">
					<div className="w-6 h-6 relative">
						<Image
							src="/images/product-details/producer-info/shopping-basket.svg"
							alt={t("sales_icon_alt")}
							width={24}
							height={24}
							className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
						/>
					</div>
					<span className="text-base font-semibold text-content-title">
						{t("sales_on_cofiblocks")}
					</span>
				</div>
				<div className="flex items-center gap-4">
					<span className="text-base text-content-title">{salesCount}</span>
				</div>
			</div>

			<div className="w-full px-4 py-3 bg-white rounded-lg flex justify-between items-center">
				<div className="flex items-center gap-4">
					<div className="w-6 h-6 relative">
						<Image
							src="/images/product-details/producer-info/Location.svg"
							alt={t("region_icon_alt")}
							width={24}
							height={24}
							className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
						/>
					</div>
					<span className="text-base font-semibold text-content-title">
						{t("region")}
					</span>
				</div>
				<div className="flex items-center gap-4">
					<span className="text-base text-content-title">Costa Rica</span>
				</div>
			</div>

			<div className="w-full px-4 py-3 bg-white rounded-lg flex justify-between items-center">
				<div className="flex items-center gap-4">
					<div className="w-6 h-6 relative">
						<Image
							src="/images/product-details/producer-info/Send.svg"
							alt={t("altitude_icon_alt")}
							width={24}
							height={24}
							className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
						/>
					</div>
					<span className="text-base font-semibold text-content-title">
						{t("altitude")}
					</span>
				</div>
				<div className="flex items-center gap-4">
					<span className="text-base text-content-title">
						{t("altitude_value", { altitude })}
					</span>
				</div>
			</div>

			<div className="w-full px-4 py-3 bg-white rounded-lg flex justify-between items-center">
				<div className="flex items-center gap-4">
					<div className="w-6 h-6 relative">
						<Image
							src="/images/product-details/producer-info/Location.svg"
							alt={t("coordinates_icon_alt")}
							width={24}
							height={24}
							className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
						/>
					</div>
					<span className="text-base font-semibold text-content-title">
						{t("coordinates")}
					</span>
				</div>
				<div className="flex items-center gap-4">
					<span className="text-base text-content-title">{coordinates}</span>
				</div>
			</div>

			<div
				className="w-full px-4 py-3 bg-white rounded-lg flex justify-between items-center cursor-pointer"
				onClick={onWebsiteClick}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						onWebsiteClick();
					}
				}}
				role="button"
				tabIndex={0}
			>
				<div className="flex items-center gap-4">
					<div className="w-6 h-6 relative">
						<Image
							src="/images/product-details/producer-info/External-link.svg"
							alt={t("website_icon_alt")}
							width={24}
							height={24}
							className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
						/>
					</div>
					<span className="text-base font-semibold text-content-title">
						{t("website")}
					</span>
				</div>
				<div className="flex items-center gap-4">
					<ChevronRightIcon className="w-6 h-6 text-content-title" />
				</div>
			</div>

			<FarmModal
				isOpen={isFarmModalOpen}
				onClose={closeFarmModal}
				farmData={farmData}
				isEditable={isEditable}
				onEdit={() => {
					closeFarmModal();
					router.push("/user/edit-profile/farm-profile");
				}}
			/>
		</div>
	);
}
