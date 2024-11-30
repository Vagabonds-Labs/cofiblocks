import Alert from "@repo/ui/alert";
import type { Meta, StoryObj } from "@storybook/react";
import type React from "react";
import { useState } from "react";

const meta: Meta<typeof Alert> = {
	title: "Components/Alert",
	tags: ["autofocus"],
	component: Alert,
	parameters: {
		controls: { expanded: true },
	},
	argTypes: {
		type: {
			control: { type: "select" },
			options: ["success", "error", "info"],
		},
	},
};

export default meta;

type Story = StoryObj<typeof Alert>;

export const Template: Story = (
	args: React.JSX.IntrinsicAttributes & {
		message: string;
		description: string;
		type: "success" | "error" | "info";
		onDismiss: () => void;
	},
) => {
	const [isVisible, setIsVisible] = useState(true);

	if (!isVisible) return null;

	return <Alert {...args} onDismiss={() => setIsVisible(false)} />;
};

Template.args = {
	message: "This is an alert",
	description: "This is an alert description",
	type: "success",
};
