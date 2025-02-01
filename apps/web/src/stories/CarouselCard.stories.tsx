//This is a reusable card component designed for use in carousels or grids.
import type { Meta, StoryObj } from "@storybook/react";
import CarouselCard, {
	type CardProps,
} from "../../../../packages/ui/src/carouselCard";

//This meta object configures the CarouselCard for Storybook.
const meta: Meta<typeof CarouselCard> = {
	title: "Components/CarouselCard", //organizes components under the "CarouselCard component"
	tags: ["autodocs"], //automates documentation generation
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

// showcases a typical/default CarouselCard with all its properties
const defaultArgs: CardProps = {
	tag: "Tech",
	title: "Latest Innovations in Technology",
	id: "1",
	image: "https://via.placeholder.com/380x180?text=Card+Image",
};

export const Default: Story = {
	args: { ...defaultArgs },
};

// Aria best accessibility practices with the CarouselCard include using aria-label or aria-labelledby attribute
// to link the card's title to its content for users; example :
<CarouselCard
	tag="Cofiblock Store"
	title="Latest Cofiblock Stores "
	id="1"
	image="https://via.placeholder.com/380x180?text=Card+Image"
	aria-label="Latest Cofiblock Stores"
/>;
