import { DataCard } from "@repo/ui/dataCard";
// DataCard.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof DataCard> = {
	title: "Components/DataCard",
	component: DataCard,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DataCard>;

export const Default: Story = {
	args: {
		title: "Default Title",
		value: "Default Value",
	},
};

export const WithLongContent: Story = {
	args: {
		title: "A Very Long Title That Might Need Wrapping",
		value:
			"A very long value that demonstrates how the card handles extended content",
	},
};

export const WithNumbers: Story = {
	args: {
		title: "Price",
		value: "$1,234.56",
	},
};

export const WithRegion: Story = {
	args: {
		title: "Region",
		value: "Colombia",
	},
};

export const WithStrength: Story = {
	args: {
		title: "Strength",
		value: "Medium",
	},
};
