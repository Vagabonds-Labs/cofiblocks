import NFTCard from "@repo/ui/nftCard";
import { type Meta, StoryFn, type StoryObj } from "@storybook/react";
import type React from "react";

export default {
	title: "Components/NFTCard",
	tags: ["autodocs"],
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

Template.args = {
	title: "Interactive NFT",
	nftMetadata: {
		imageSrc: "https://via.placeholder.com/250",
	},
	onDetailsClick: () => alert("Details button clicked"),
};
