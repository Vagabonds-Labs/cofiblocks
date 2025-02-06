//These Typography components (H1, H2, H3, H4, Text, TextSecondary, TextLegend)
// provide a set of styled text elements for headings, paragraphs, and supplementary content.
import {
	H1,
	H2,
	H3,
	H4,
	Text,
	TextLegend,
	TextSecondary,
} from "@repo/ui/typography";
import type { Meta } from "@storybook/react";
import React from "react";

//This meta object configures the Typography for Storybook
export default {
	title: "Components/Typography", //organizes components under the "Typography component"
	tags: ["autodocs"], //automates documentation generation
	argTypes: {
		className: {
			control: "text",
			description: "Additional classes to style the components.",
			defaultValue: "",
		},
		isSemiBold: {
			control: "boolean",
			description:
				"Sets the font weight to semi-bold (only applicable for Text).",
			defaultValue: false,
		},
	},
} as Meta;

export const TypographyShowcase = ({ className = "", isSemiBold = false }) => (
	<div className="flex flex-col gap-4 p-4">
		<H1 className={className}>This is an H1 Heading</H1>
		<H2 className={className}>This is an H2 Heading</H2>
		<H3 className={className}>This is an H3 Heading</H3>
		<H4 className={className}>This is an H4 Heading</H4>
		<Text className={className} isSemiBold={isSemiBold}>
			This is a paragraph.{" "}
			{isSemiBold ? "It's semi-bold." : "It's normal weight."}
		</Text>
		<TextSecondary className={className}>This is secondary text.</TextSecondary>
		<TextLegend className={className}>This is legend text.</TextLegend>
	</div>
);

//Usage Examples
//Basic Typography
<TypographyShowcase />;

//Custom Styling
<TypographyShowcase className="text-blue-600" />;

//Semi-Bold Text
<Text isSemiBold>This is a semi-bold paragraph.</Text>;

//In the aria attributes and accessibilities,
// you should use H1, H2, H3, and H4 for headings to convey the structure of
// the content to assistive technologies. If the Typography components are used
// as interactive elements, add role, aria-label, or aria-describedby attributes as appropriate.
