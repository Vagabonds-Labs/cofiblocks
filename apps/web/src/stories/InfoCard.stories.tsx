import { InfoCard } from "@repo/ui/infoCard";
import type { Meta, StoryFn } from "@storybook/react";
import React from "react";

export default {
	title: "Components/InfoCard",
	component: InfoCard,
	tags: ["autodocs"],
	argTypes: {
		title: { control: "text", description: "The title of the InfoCard" },
		options: {
			control: false,
			description: "Options displayed in the InfoCard",
		},
		children: { control: false, description: "Optional child components" },
	},
} as Meta;

const options = [
	{
		label: "Option 1",
		iconSrc: "/images/Avatar.png",
		selected: false,
		onClick: () => alert("Option 1 clicked"),
	},
	{
		label: "Option 2",
		iconSrc: "/images/Avatar.png",
		selected: true,
		onClick: () => alert("Option 2 clicked"),
	},
	{
		label: "Option 3",
		iconSrc: "/images/Avatar.png",
		selected: false,
		onClick: () => alert("Option 3 clicked"),
	},
];

const Template: StoryFn = (args) => (
	<InfoCard title={""} options={options} {...args} />
);

export const Default = Template.bind({});
Default.args = {
	title: "Default InfoCard",
	options,
};

export const NoOptions = Template.bind({});
NoOptions.args = {
	title: "InfoCard with No Options",
	options: [],
	children: <p>No options available</p>,
};
