//Thia Tooltip component provides contextual information
// when users hover over, focus on, or tap on an element
import Tooltip from "@repo/ui/tooltip";
import type { Meta } from "@storybook/react";

//This meta object configures the Tooltip for Storybook
export default {
	title: "Components/Tooltip", //organizes components under the "Tooltip component"
	tags: ["autodocs"], //automates documentation generation
	component: Tooltip,
	argTypes: {
		content: {
			control: "text",
			description: "The content to display inside the tooltip.",
			defaultValue: "Tooltip Content",
		},
		position: {
			control: { type: "select" },
			options: ["top", "bottom", "left", "right"],
			description: "The position of the tooltip relative to the child.",
			defaultValue: "top",
		},
		children: {
			description: "The element the tooltip is attached to.",
			table: { type: { summary: "React.ReactNode" } },
		},
	},
} as Meta<typeof Tooltip>;

export const TooltipPositions = () => {
	const positions: ("top" | "bottom" | "left" | "right")[] = [
		"top",
		"bottom",
		"left",
		"right",
	];

	return (
		<div className="flex gap-4 justify-center items-center h-screen">
			{positions.map((position) => (
				<Tooltip
					key={position}
					content={`This is a ${position} tooltip!`}
					position={position}
				>
					<button
						type="button"
						className="px-4 py-2 bg-blue-600 text-white rounded capitalize"
					>
						{position}
					</button>
				</Tooltip>
			))}
		</div>
	);
};
