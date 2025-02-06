//The Modal component is a pop-up dialog used to
// present information or actions in a focused manner.
import Modal from "@repo/ui/modal";
import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import TestIcon from "./assets/youtube.svg";

//This meta object configures the Modal for Storybook
export default {
	title: "Components/Modal", //organizes components under the "Modal component"
	tags: ["autodocs"], //automates documentation generation
	component: Modal,
	argTypes: {
		isOpen: {
			control: "boolean",
			description: "Controls whether the modal is open or closed",
		},
		onClose: {
			action: "closed",
			description: "Callback function when the modal is closed",
		},
		buttons: {
			control: "object",
			description: "Array of buttons to display inside the modal",
		},
	},
} as Meta;

const buttons = [
	{
		label: "Action 1",
		onClick: () => alert("Action 1 clicked"),
	},
	{
		label: "Action 2",
		onClick: () => alert("Action 2 clicked"),
	},
];

const Template: StoryFn = (args) => (
	<Modal
		isOpen={false}
		onClose={(): void => {
			throw new Error("Function not implemented.");
		}}
		buttons={buttons}
		{...args}
	/>
);

//The default modal configuration with basic buttons.
export const Default = Template.bind({});
Default.args = {
	isOpen: true,
	onClose: () => alert("Modal closed"),
	buttons,
};

//This modal includes buttons with icons (e.g., accept and decline buttons).
export const Icons = Template.bind({});
Icons.args = {
	isOpen: true,
	onClose: () => alert("Modal closed"),
	buttons: [
		{ label: "Accept", onClick: () => alert("Accept clicked") },
		{
			label: "Decline",
			onClick: () => alert("Decline clicked"),
			icon: <TestIcon />,
		},
	],
};

//This modal is displayed without any buttons, useful for informational modals or alerts.
export const NoButtons = Template.bind({});
NoButtons.args = {
	isOpen: true,
	onClose: () => alert("Modal closed"),
	buttons: [],
};
