//This Particle component animates particles within a container.
// It is a visual, aesthetic component often used for decorative
// or interactive purposes in UI design.
import Particle from "@repo/ui/particle";
import type { Meta, StoryFn } from "@storybook/react";

//This meta object configures the Particle for Storybook
export default {
	title: "Components/Particle", //organizes components under the "Particle component"
	tags: ["autodocs"], //automates documentation generation
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

//This implements the default behavior of the Particle component with delay.
export const Default = Template.bind({});
Default.args = {
	delay: 0,
};

//This implements the particle animation with a 1-second delay.
export const WithDelay = Template.bind({});
WithDelay.args = {
	delay: 1,
};

//This shows how the Particle component behaves when the user prefers reduced motion.
export const ReducedMotion = Template.bind({});
ReducedMotion.args = {
	delay: 0,
};
ReducedMotion.parameters = {
	css: `
    @media (prefers-reduced-motion: reduce) {
      .particle-animation {
        animation: none;
      }
    }
  `,
};

//In the aria attributes and accessibilities, you can use [aria-hidden="true"]
// to hide it from assistive technologies like screen readers.
<div className="relative w-[200px] h-[200px] bg-black">
	<Particle delay={1} aria-hidden="true" />
</div>;
