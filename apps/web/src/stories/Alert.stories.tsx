import Alert from "@repo/ui/alert";
import type { Meta, StoryObj } from "@storybook/react";
import type React from "react";
import { useState } from "react";

//This meta object defines metadata for the Alert component story,
// including its title, tags, and component settings.

const meta: Meta<typeof Alert> = {
	title: "Components/Alert", //Specifies the name and hierarchical path for the story given an example "Alert"
	tags: ["autodocs"],
	component: Alert,
	parameters: {
		controls: { expanded: true },
	},
	argTypes: {
		//Defines controls for component props, enabling dynamic interaction in the Storybook UI.
		type: {
			control: { type: "select" },
			options: ["success", "error", "info"],
		},
	},
};

export default meta;

type Story = StoryObj<typeof Alert>;

//This Template story demonstrates how the Alert component behaves with specific arguments (args). It includes a state (isVisible) to manage the visibility of the Alert
export const Template: Story = (
	args: React.JSX.IntrinsicAttributes & {
		message: string;
		description: string;
		type: "success" | "error" | "info";
		onDismiss: () => void;
	},
) => {
	//Example code
	const [isVisible, setIsVisible] = useState(true);

	if (!isVisible) return null;

	return <Alert {...args} onDismiss={() => setIsVisible(false)} />;
};

Template.args = {
	message: "This is an alert",
	description: "This is an alert description",
	type: "success",
};
