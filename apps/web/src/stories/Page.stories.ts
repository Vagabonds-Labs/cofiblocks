//The Page component serves as an example layout with conditional rendering
// for a logged-in or logged-out user
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";

import { Page } from "./Page";

//This meta object configures the Page
const meta = {
	title: "Example/Page", //organizes components under the "Page Component"
	component: Page,
	parameters: {
		// More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
		layout: "fullscreen",
	},
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

//This story shows the default, logged-out state.
export const LoggedOut: Story = {};

// More on interaction testing: https://storybook.js.org/docs/writing-tests/interaction-testing
// This shows Logged-In State with Interactions
export const LoggedIn: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const loginButton = canvas.getByRole("button", { name: /Log in/i });
		await expect(loginButton).toBeInTheDocument();
		await userEvent.click(loginButton);
		await expect(loginButton).not.toBeInTheDocument();

		const logoutButton = canvas.getByRole("button", { name: /Log out/i });
		await expect(logoutButton).toBeInTheDocument();
	},
};
