import type { Meta, StoryFn, StoryObj } from "@storybook/react";

import { Button } from "./Button";

export default {
	title: "Components/Button",
	component: Button,
	argTypes: {
		variant: {
			control: "select",
			options: ["primary", "secondary", "danger"],
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

export const Default = Template.bind({});
Default.args = {
	children: "Click Me",
};

export const WithIcon = Template.bind({});
WithIcon.args = {
	children: "Add Item",
	variant: "primary",
	// icon: <FiPlus />,
};

export const Disabled = Template.bind({});
Disabled.args = {
	children: "Disabled",
	disabled: true,
};

export const Variants: StoryFn = () => (
	<div style={{ display: "flex", gap: "1rem" }}>
		<Button variant="primary">Primary</Button>
		<Button variant="secondary">Secondary</Button>
	</div>
);

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
