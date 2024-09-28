import NFTCard from "@repo/ui/nftCard";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";

// TODO: Load collectibles from database and/or blockchain
const collectibles = [
	{
		id: 1,
		title: "Café de Especialidad 1",
		description: "Descripción del Café de Especialidad 1.",
		imageUrl: "/images/cafe1.webp",
		imageAlt: "Paquete de Café de Especialidad 1",
	},
	{
		id: 2,
		title: "Café de Especialidad 2",
		description: "Descripción del Café de Especialidad 2.",
		imageUrl: "/images/cafe2.webp",
		imageAlt: "Paquete de Café de Especialidad 2",
	},
	{
		id: 3,
		title: "Café de Especialidad 3",
		description: "Descripción del Café de Especialidad 3.",
		imageUrl: "/images/cafe3.webp",
		imageAlt: "Paquete de Café de Especialidad 3",
	},
];

export default function Collectibles() {
	return (
		<ProfileOptionLayout title="My collectibles">
			<div className="space-y-6">
				{collectibles.map((collectible) => (
					<NFTCard
						key={collectible.id}
						title={collectible.title}
						nftMetadata={{ imageSrc: collectible.imageUrl }}
					/>
				))}
			</div>
		</ProfileOptionLayout>
	);
}
