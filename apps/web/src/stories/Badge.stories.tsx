//The Badge component is a versatile UI element designed to display small amounts of contextual information

import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import Badge from "../../../../packages/ui/src/badge";

export default {
	// This meta object configures the Storybook settings for the Badge component
	title: "Components/Badge", //organises the components under the "Components" section here.
	component: Badge,
	tags: ["autodocs"], //automates documentation generation
	argTypes: {
		variant: {
			control: "radio",
			options: ["default", "primary", "secondary", "accent", "success"],
		},
		size: {
			control: "radio",
			options: ["sm", "md", "lg"],
		},
	},
} as Meta;

const Template: StoryFn<typeof Badge> = (args) => <Badge {...args} />;

//This is the default story that showcases the basic badge components
export const Default = Template.bind({});
Default.args = {
	text: "Default Badge",
	variant: "default",
	size: "md",
};

//This showcases variant options of the Badge component.
export const Variants: StoryFn = () => (
	<div style={{ display: "flex", gap: "1rem" }}>
		<Badge variant="primary" text="Primary" />
		<Badge variant="secondary" text="Secondary" />
		<Badge variant="accent" text="Accent" />
		<Badge variant="success" text="success" />
	</div>
);

//This demonstrates all the size options of the Badge component.
export const Sizes: StoryFn = () => (
	<div style={{ display: "flex", gap: "1rem" }}>
		<Badge variant="primary" text="Primary" size="sm" />
		<Badge variant="accent" text="Primary" size="md" />
		<Badge variant="secondary" text="Primary" size="lg" />
	</div>
);

// Aria best practices with the Badge include using aria-live for a content to dynamically update as in below:
<Badge aria-live="polite" variant="primary" text="Success" />;

// for an interactive badge ; example
<Badge variant="accent" text="Clickable Badge" />;

//If the badge contains icons or dynamic data, ensure there is an accessible label using aria-label or visually hidden text.e.g
<Badge variant="success" text=" " aria-label="Success Badge" />;
