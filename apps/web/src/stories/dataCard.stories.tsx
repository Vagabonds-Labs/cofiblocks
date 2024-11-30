import { DataCard } from "@repo/ui/dataCard";
import type { Meta, StoryFn } from "@storybook/react";
import React from "react";

export default {
	title: "Components/DataCard",
	tags: ["autodocs"],
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

export const Default = Template.bind({});
Default.args = {
	label: "Default Label",
	value: "Default Value",
	iconSrc: "https://via.placeholder.com/250",
	variant: "default",
};

export const ErrorCard = Template.bind({});
ErrorCard.args = {
	label: "Error Label",
	value: "Error Value",
	iconSrc: "https://via.placeholder.com/250",
	variant: "error",
};

export const CustomIcon = Template.bind({});
CustomIcon.args = {
	label: "Custom Icon Label",
	value: "Custom Icon Value",
	iconSrc: "https://via.placeholder.com/250",
	variant: "default",
};
