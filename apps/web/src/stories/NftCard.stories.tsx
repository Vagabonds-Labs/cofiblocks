//The NFTCard component is used to display details about an NFT (Non-Fungible Token).
// It includes metadata such as the image, title, and a button to view more details
import NFTCard from "@repo/ui/nftCard";
import type { Meta, StoryObj } from "@storybook/react";
import type React from "react";

///This meta object configures the NFTcard for Storybook
export default {
	title: "Components/NFTCard", //organizes components under the "NFTcard component"
	tags: ["autodocs"], //automates documentation generation
	component: NFTCard,
	argTypes: {
		onDetailsClick: { action: "clicked" },
		nftMetadata: {
			control: "object",
			defaultValue: {
				imageSrc: "https://via.placeholder.com/150",
			},
		},
	},
} as Meta;

type Story = StoryObj<typeof NFTCard>;

export const Template: Story = (
	args: React.JSX.IntrinsicAttributes & {
		title: string;
		nftMetadata: {
			imageSrc: string;
		};
		onDetailsClick: () => void;
	},
) => {
	return <NFTCard {...args} />;
};
//The default story with the basic NFT metadata
Template.args = {
	title: "Interactive NFT",
	nftMetadata: {
		imageSrc: "https://via.placeholder.com/250",
	},
	onDetailsClick: () => alert("Details button clicked"),
};
