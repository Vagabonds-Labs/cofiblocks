//The InfoCard component is a versatile UI element designed to display
// a title and a list of interactive options or child components.
import { InfoCard } from "@repo/ui/infoCard";
import type { Meta, StoryFn } from "@storybook/react";
import React from "react";

//This meta object configures the InfoCard for Storybook
export default {
	title: "Components/InfoCard", //organizes components under the "InfoCard component"
	component: InfoCard,
	tags: ["autodocs"], //automates documentation generation
	argTypes: {
		title: { control: "text", description: "The title of the InfoCard" },
		options: {
			control: false,
			description: "Options displayed in the InfoCard",
		},
		children: { control: false, description: "Optional child components" }, //Optional child components, useful when no options are provided
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

//shows an InfoCard with a title and multiple options.
export const Default = Template.bind({});
Default.args = {
	title: "Default InfoCard",
	options,
};

// shows the InfoCard without options, showing a fallback message using children.
export const NoOptions = Template.bind({});
NoOptions.args = {
	title: "InfoCard with No Options",
	options: [],
	children: <p>No options available</p>,
};

//To make the InfoCard accessible, you can use [role="group"] for the InfoCard to indicate it groups related options
// and 'aria-labelledby' on the options container to associate it with the title.
// Use 'aria-pressed' for selectable options to indicate their current state.
<InfoCard
	title="Accessible InfoCard"
	options={[
		{
			label: "Option 1",
			iconSrc: "/images/Avatar.png",
			selected: false,
			onClick: () => alert("Option 1 clicked"),
		},
	]}
/>;
