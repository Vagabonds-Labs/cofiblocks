//This SkeletonLoader component is a placeholder UI element used to indicate loading state

import SkeletonLoader from "@repo/ui/skeleton";
import type { Meta, StoryObj } from "@storybook/react";

//This meta object configures the SkeletonLoader for Storybook
export default {
	title: "Components/SkeletonLoader", //organizes components under the "SkeletonLoader component"
	tags: ["autodocs"], //automates documentation generation
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
//This implements the default Skeleton Loader
Template.args = {
	width: "w-[25rem]", // This can also be customized as  "w-full" and "h-24"
	height: "h-[50rem]",
};

// dimensions can also be full screen loader
// using width: "w-screen",
// height: "h-screen",

// Usage examples
//Basic SkeletonLoader
<SkeletonLoader width="w-[20rem]" height="h-[40rem]" />;

//Customized SkeletonLoader
<SkeletonLoader width="w-full" height="h-24" />;

//In the aria attributes and accessibilities,
// you should [role="progressbar"] to indicate that the component represents a loading state
// Add aria-busy="true" to inform users that the content is still loading.
// Use aria-hidden="true" if the SkeletonLoader is purely decorative and not necessary for users.
// example as seen below;
<div
	aria-busy="true"
	aria-label="Loading content"
	className="skeleton-loader"
/>;
