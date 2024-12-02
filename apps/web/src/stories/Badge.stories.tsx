import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import Badge from "../../../../packages/ui/src/badge";

export default {
	title: "Components/Badge",
	component: Badge,
	tags: ["autodocs"],
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

export const Default = Template.bind({});
Default.args = {
	text: "Default Badge",
	variant: "default",
	size: "md",
};

export const Variants: StoryFn = () => (
	<div style={{ display: "flex", gap: "1rem" }}>
		<Badge variant="primary" text="Primary" />
		<Badge variant="secondary" text="Secondary" />
		<Badge variant="accent" text="Accent" />
		<Badge variant="success" text="success" />
	</div>
);

export const Sizes: StoryFn = () => (
	<div style={{ display: "flex", gap: "1rem" }}>
		<Badge variant="primary" text="Primary" size="sm" />
		<Badge variant="accent" text="Primary" size="md" />
		<Badge variant="secondary" text="Primary" size="lg" />
	</div>
);
