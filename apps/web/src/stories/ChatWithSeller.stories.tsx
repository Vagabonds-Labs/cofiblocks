import { ChatWithSeller } from "@repo/ui/chatWithSeller";
import type { Meta, StoryFn } from "@storybook/react";
import React from "react";

export default {
	title: "Components/ChatWithSeller",
	tags: ["autodocs"],
	component: ChatWithSeller,
	argTypes: {
		name: {
			control: "text",
			description: "The name of the seller.",
			defaultValue: "John Doe",
		},
		description: {
			control: "text",
			description: "A short description about the seller.",
			defaultValue: "Here to help you with your queries",
		},
		avatarSrc: {
			control: "text",
			description: "The source URL for the seller's avatar image.",
			defaultValue: "/images/user-profile/avatar.svg",
		},
		onClick: {
			action: "clicked",
			description: "Callback function for when the button is clicked.",
		},
	},
} as Meta<typeof ChatWithSeller>;

const Template: StoryFn<typeof ChatWithSeller> = (args) => (
	<div className="p-4 max-w-sm mx-auto">
		<ChatWithSeller {...args} />
	</div>
);

export const Default = Template.bind({});
Default.args = {
	name: "Jane Doe",
	description: "Click to chat with the seller",
	avatarSrc: "/images/user-profile/avatar.svg",
	onClick: () => alert("Navigating to chat..."),
};
