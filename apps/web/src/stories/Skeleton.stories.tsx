import SkeletonLoader from "@repo/ui/skeleton";
import type { Meta, StoryObj } from "@storybook/react";

export default {
	title: "Components/SkeletonLoader",
	tags: ["autodocs"],
	component: SkeletonLoader,
	argTypes: {
		width: {
			control: "text",
			description: "The width of the skeleton loader.",
			defaultValue: "w-[19.5rem]",
		},
		height: {
			control: "text",
			description: "The height of the skeleton loader.",
			defaultValue: "h-[44rem]",
		},
	},
} as Meta<typeof SkeletonLoader>;

type Story = StoryObj<typeof SkeletonLoader>;

export const Template: Story = (
	args: React.JSX.IntrinsicAttributes & {
		message: string;
		description: string;
		type: "success" | "error" | "info";
		onDismiss: () => void;
	},
) => {
	return <SkeletonLoader {...args} />;
};

Template.args = {
	width: "w-[25rem]",
	height: "h-[50rem]",
};
