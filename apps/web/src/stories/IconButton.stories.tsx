import { ArrowRightIcon, HomeIcon } from "@heroicons/react/24/solid";
import IconButton from "@repo/ui/iconButton";
import type { Meta, StoryFn } from "@storybook/react";

export default {
	title: "Components/IconButton",
	tags: ["autodocs"],
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

export const WithHomeIcon = Template.bind({});
WithHomeIcon.args = {
	icon: <HomeIcon />,
	variant: "secondary",
	size: "lg",
};

export const Disabled = Template.bind({});
Disabled.args = {
	icon: <ArrowRightIcon />,
	variant: "primary",
	size: "md",
	disabled: true,
};

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
