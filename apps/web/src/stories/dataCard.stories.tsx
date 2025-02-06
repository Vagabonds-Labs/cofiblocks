//Th is a  DataCard component  that displays a label, value, and optional icon in a card format
import { DataCard } from "@repo/ui/dataCard";
import type { Meta, StoryFn } from "@storybook/react";
import React from "react";

//This meta object configures the dataCard for Storybook
export default {
	title: "Components/DataCard", //organizes components under the "dataCard component"
	tags: ["autodocs"], //automates documentation generation
	component: DataCard,
	argTypes: {
		label: {
			control: "text",
			description: "The label displayed on the card.",
			defaultValue: "Label",
		},
		value: {
			control: "text",
			description: "The value displayed on the card.",
			defaultValue: "Value",
		},
		iconSrc: {
			control: "text",
			description: "The source URL for the icon image.",
			defaultValue: "/images/placeholder.svg",
		},
		variant: {
			control: "select",
			options: ["default", "error"],
			description: "The visual variant of the card.",
			defaultValue: "default",
		},
	},
} as Meta<typeof DataCard>;

const Template: StoryFn<typeof DataCard> = (args) => (
	<div className="p-4 flex justify-center items-center">
		<DataCard {...args} />
	</div>
);

//This showcases the default appearance of the DataCard.
export const Default = Template.bind({});
Default.args = {
	label: "Default Label",
	value: "Default Value",
	iconSrc: "https://via.placeholder.com/250",
	variant: "default",
};

//This demonstrates the error variant of the DataCard.
export const ErrorCard = Template.bind({});
ErrorCard.args = {
	label: "Error Label",
	value: "Error Value",
	iconSrc: "https://via.placeholder.com/250",
	variant: "error",
};

//This displays a custom icon in the DataCard.
export const CustomIcon = Template.bind({});
CustomIcon.args = {
	label: "Custom Icon Label",
	value: "Custom Icon Value",
	iconSrc: "https://via.placeholder.com/250",
	variant: "default",
};

//To make the DataCard accessible, you can use [role="group"] to signify that the card groups related content.
// and also use aria-labelledby for the label and aria-describedby for the value to associate them with the card.
//example as seen below:
<div
	role="group"
	aria-labelledby="data-card-label"
	aria-describedby="data-card-value"
>
	<DataCard
		label="Accessible Label"
		value="Accessible Value"
		iconSrc="https://via.placeholder.com/250"
		variant="default"
	/>
</div>;
