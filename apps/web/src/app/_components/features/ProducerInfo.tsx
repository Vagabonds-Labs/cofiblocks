import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

	const farmData = {
		name: farmName,
		since: farmSince ?? "2020",
		bio: farmBio ?? "Farm bio description",
		experiences: farmExperiences ?? "Farm experiences",
		goodPractices: farmGoodPractices ?? "Farm good practices",
	};

	const openFarmModal = () => setIsFarmModalOpen(true);
	const closeFarmModal = () => setIsFarmModalOpen(false);

	return (
		<div className="flex flex-col items-center mt-6">
			<div className="w-24 h-24 relative overflow-hidden mb-6">
				<Image
					src="/images/Avatar.png"
					alt="Producer Avatar"
					width={96}
					height={96}
					className="object-cover"
				/>
			</div>
			<h2 className="text-2xl font-bold text-content-title mb-6">
				About the producer
			</h2>

			<div
				className="w-full px-4 py-3 bg-white rounded-lg flex justify-between items-center cursor-pointer"
				onClick={openFarmModal}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						openFarmModal();
					}
				}}
				role="button"
				tabIndex={0}
			>
				<div className="flex items-center gap-4">
					<div className="w-6 h-6 relative">
						<Image
							src="/images/product-details/producer-info/farm.svg"
							alt="Farm icon"
							width={24}
							height={24}
							className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
						/>
					</div>
					<span className="text-base font-semibold text-content-title">
						Farm
					</span>
				</div>
				<div className="flex items-center gap-4">
					<span className="text-base text-content-title">{farmName}</span>
					<ChevronRightIcon className="w-6 h-6 text-content-title" />
				</div>
			</div>

			<div className="w-full px-4 py-3 bg-white rounded-lg flex justify-between items-center">
				<div className="flex items-center gap-4">
					<div className="w-6 h-6 relative">
						<Image
							src="/images/product-details/producer-info/Star.svg"
							alt="Reviews icon"
							width={24}
							height={24}
							className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
						/>
					</div>
					<span className="text-base font-semibold text-content-title">
						Reviews
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
							alt={`Star ${starIndex}`}
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
							alt="Sales icon"
							width={24}
							height={24}
							className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
						/>
					</div>
					<span className="text-base font-semibold text-content-title">
						Sales on Cofiblocks
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
							alt="Location icon"
							width={24}
							height={24}
							className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
						/>
					</div>
					<span className="text-base font-semibold text-content-title">
						Region
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
							alt="Altitude icon"
							width={24}
							height={24}
							className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
						/>
					</div>
					<span className="text-base font-semibold text-content-title">
						Altitude
					</span>
				</div>
				<div className="flex items-center gap-4">
					<span className="text-base text-content-title">
						{altitude} metros
					</span>
				</div>
			</div>

			<div className="w-full px-4 py-3 bg-white rounded-lg flex justify-between items-center">
				<div className="flex items-center gap-4">
					<div className="w-6 h-6 relative">
						<Image
							src="/images/product-details/producer-info/Location.svg"
							alt="Coordinates icon"
							width={24}
							height={24}
							className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
						/>
					</div>
					<span className="text-base font-semibold text-content-title">
						Coordinates
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
							alt="Website icon"
							width={24}
							height={24}
							className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
						/>
					</div>
					<span className="text-base font-semibold text-content-title">
						Website
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
