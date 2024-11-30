import Modal from "@repo/ui/modal";
import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import TestIcon from "./assets/youtube.svg";

export default {
	title: "Components/Modal",
	tags: ["autodocs"],
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

export const Default = Template.bind({});
Default.args = {
	isOpen: true,
	onClose: () => alert("Modal closed"),
	buttons,
};

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

export const NoButtons = Template.bind({});
NoButtons.args = {
	isOpen: true,
	onClose: () => alert("Modal closed"),
	buttons: [],
};
