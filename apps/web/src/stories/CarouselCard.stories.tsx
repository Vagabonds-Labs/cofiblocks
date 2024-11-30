import type { Meta, StoryObj } from "@storybook/react";
import CarouselCard, {
	type CardProps,
} from "../../../../packages/ui/src/carouselCard";

const meta: Meta<typeof CarouselCard> = {
	title: "Components/CarouselCard",
	tags: ["autodocs"],
	component: CarouselCard,
	parameters: {
		controls: { expanded: true },
	},
	argTypes: {
		tag: {
			description: "The tag displayed at the top of the card.",
			control: { type: "text" },
		},
		title: {
			description: "The title text displayed on the card.",
			control: { type: "text" },
		},
		image: {
			description: "Background image URL for the card.",
			control: { type: "text" },
		},
	},
};

export default meta;

type Story = StoryObj<typeof CarouselCard>;

const defaultArgs: CardProps = {
	tag: "Tech",
	title: "Latest Innovations in Technology",
	id: "1",
	image: "https://via.placeholder.com/380x180?text=Card+Image",
};

export const Default: Story = {
	args: { ...defaultArgs },
};
