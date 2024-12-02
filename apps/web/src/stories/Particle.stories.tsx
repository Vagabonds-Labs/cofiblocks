import Particle from "@repo/ui/particle";
import type { Meta, StoryFn } from "@storybook/react";

export default {
	title: "Components/Particle",
	tags: ["autodocs"],
	component: Particle,
	argTypes: {
		delay: {
			control: { type: "number", min: 0, max: 5, step: 0.1 },
			description: "Delay before the particle animation starts",
		},
	},
} as Meta<typeof Particle>;

const Template: StoryFn<typeof Particle> = (args) => (
	<div className="relative w-[200px] h-[200px] bg-black">
		<Particle {...args} />
	</div>
);

export const Default = Template.bind({});
Default.args = {
	delay: 0,
};

export const WithDelay = Template.bind({});
WithDelay.args = {
	delay: 1,
};
