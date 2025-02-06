//This is a reusable UI component for intereactive actions

import { ArrowRightIcon } from "@heroicons/react/24/solid";
import Button from "@repo/ui/button";
import type { Meta, StoryFn } from "@storybook/react";

export default {
	//Meta configures the settings for the Button component
	title: "Components/Button", //organizes components under the "Button component"
	tags: ["autodocs"], //automates documentation generation
	component: Button,
	argTypes: {
		variant: {
			control: "select",
			options: ["primary", "secondary"],
			description: "Controls the button style variant",
		},
		size: {
			control: "select",
			options: ["small", "medium", "large"],
			description: "Controls the button size",
		},
		icon: {
			control: false,
			description: "Optional icon to display alongside the button text",
		},
		disabled: {
			control: "boolean",
			description: "Disables the button if set to true",
		},
		onClick: {
			action: "clicked",
			description: "Callback function when the button is clicked",
		},
	},
} as Meta;

const Template: StoryFn<typeof Button> = (args) => <Button {...args} />;

//showcases a button in the disabled state
export const Disabled = Template.bind({});
Disabled.args = {
	children: "Disabled",
	disabled: true,
};

//showcases using a icon with a button text
export const WithIcon = Template.bind({});
WithIcon.args = {
	children: "Icon",
	variant: "primary",
	icon: <ArrowRightIcon />,
};

//illustrates the variant options "primary" and "secondary"
export const Variants: StoryFn = () => (
	<div style={{ display: "flex", gap: "1rem" }}>
		<Button variant="primary">Primary</Button>
		<Button variant="secondary">Secondary</Button>
	</div>
);

//showcases all size options for the button component
export const Sizes: StoryFn = () => (
	<div style={{ display: "flex", gap: "1rem" }}>
		<Button variant="primary" size="sm">
			Small
		</Button>
		<Button variant="secondary" size="md">
			Medium
		</Button>
		<Button variant="primary" size="lg">
			Large
		</Button>
		<Button variant="secondary" size="xl">
			Large
		</Button>
	</div>
);

// Aria best practices with the Button include using aria-label or aria-labelledby attribute
// to provide accessible name without visible text such as
<Button aria-label="Submit Form" variant="primary" />;

// using in disabled button example:
<Button disabled aria-disabled="true" variant="secondary">
	Disabled Button
</Button>;

//using accessible label with icon button example:
<Button icon={<ArrowRightIcon />} aria-label="Next Page" />;
