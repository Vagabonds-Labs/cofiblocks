//This IconButton component is a button designed to display an icon with various sizes, styles, and states.
import { ArrowRightIcon, HomeIcon } from "@heroicons/react/24/solid";
import IconButton from "@repo/ui/iconButton";
import type { Meta, StoryFn } from "@storybook/react";

//This meta object configures the IconButton for Storybook
export default {
	title: "Components/IconButton", //organizes components under the "IconButton component"
	tags: ["autodocs"], //automates documentation generation
	component: IconButton,
	argTypes: {
		variant: {
			control: "select",
			options: ["primary", "secondary"],
			description: "Controls the button style variant",
		},
		size: {
			control: "select",
			options: ["xl", "lg", "md", "sm"],
			description: "Controls the button size",
		},
		icon: {
			control: false,
			description: "Icon to display inside the button",
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

const Template: StoryFn<typeof IconButton> = (args) => <IconButton {...args} />;

//Shows the IconButton with a HomeIcon.
export const WithHomeIcon = Template.bind({});
WithHomeIcon.args = {
	icon: <HomeIcon />,
	variant: "secondary",
	size: "lg",
};

//Shows the IconButton in a disabled state
export const Disabled = Template.bind({});
Disabled.args = {
	icon: <ArrowRightIcon />,
	variant: "primary",
	size: "md",
	disabled: true,
};

//shows both primary and secondary variants of the IconButton
export const Variants: StoryFn = () => (
	<div style={{ display: "flex", gap: "1rem" }}>
		<IconButton variant="primary" size="md" icon={<ArrowRightIcon />}>
			Primary
		</IconButton>
		<IconButton variant="secondary" size="md" icon={<HomeIcon />}>
			Secondary
		</IconButton>
	</div>
);

//Demonstrates all size options for the IconButton.
export const Sizes: StoryFn = () => (
	<div style={{ display: "flex", gap: "1rem" }}>
		<IconButton variant="primary" size="sm" icon={<ArrowRightIcon />}>
			Small
		</IconButton>
		<IconButton variant="primary" size="md" icon={<ArrowRightIcon />}>
			Medium
		</IconButton>
		<IconButton variant="secondary" size="lg" icon={<ArrowRightIcon />}>
			Large
		</IconButton>
		<IconButton variant="secondary" size="xl" icon={<ArrowRightIcon />}>
			Extra Large
		</IconButton>
	</div>
);

//To make the IconButton accessible, you can use [role="group"] explicitly for non-button elements styled as buttons.
// and [aria-disabled="true"] when the button is disabled to communicate its state to assistive technologies..
//example as seen below:

<IconButton
	icon={<HomeIcon />}
	variant="primary"
	size="md"
	aria-label="Navigate to home"
	disabled={true}
	aria-disabled="true"
/>;
