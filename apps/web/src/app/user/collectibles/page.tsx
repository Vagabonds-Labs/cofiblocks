"use client";

import NFTCard from "@repo/ui/nftCard";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import { useTranslation } from "~/i18n";

// TODO: Load collectibles from database and/or blockchain
const collectibles = [
	{
		id: 1,
		title: "collectible_title_1",
		description: "collectible_description_1",
		imageUrl: "/images/cafe1.webp",
		imageAlt: "collectible_image_alt_1",
	},
	{
		id: 2,
		title: "collectible_title_2",
		description: "collectible_description_2",
		imageUrl: "/images/cafe2.webp",
		imageAlt: "collectible_image_alt_2",
	},
	{
		id: 3,
		title: "collectible_title_3",
		description: "collectible_description_3",
		imageUrl: "/images/cafe3.webp",
		imageAlt: "collectible_image_alt_3",
	},
];

export default function Collectibles() {
	const { t } = useTranslation();

	return (
		<ProfileOptionLayout title={t("my_collectibles")}>
			<div className="space-y-6">
				{collectibles.map((collectible) => (
					<NFTCard
						key={collectible.id}
						title={t(collectible.title)}
						nftMetadata={{ imageSrc: collectible.imageUrl }}
					/>
				))}
			</div>
		</ProfileOptionLayout>
	);
}
