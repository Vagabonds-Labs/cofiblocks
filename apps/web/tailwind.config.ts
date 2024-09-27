import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const colors = {
	content: {
		title: "#1f1f20",
		"body-default": "#3c3e3f",
		"body-soft": "#3c3e3f",
		accent: "#e36c59",
		inverse: "#c7ccd0",
	},
	surface: {
		"primary-default": "#2d7161",
		"primary-soft": "#eaf1ef",
		"secondary-default": "#ffc222",
		"secondary-soft": "#fff1d4",
		"secondary-focus": "#e6af1f",
		"secondary-soft-focus": "#e6d9bf",
		inverse: "#ffffff",
		disable: "#f8fafc",
		border: "#c7ccd0",
	},
	info: {
		default: "#0d74ab",
		content: "#164e63",
	},
	success: {
		default: "#067c6d",
		content: "#14532d",
	},
	warning: {
		default: "#f3a620",
		content: "#713f12",
	},
	error: {
		default: "#d32a1b",
		content: "#7f1d1d",
	},
};

export default {
	content: [
		"./src/**/*.tsx",
		"./src/stories/**/*.{js,ts,jsx,tsx,mdx}",
		"../../packages/ui/**/*.{js,ts,jsx,tsx}",
	],
	daisyui: {
		themes: [
			{
				cofiblocks: colors,
			},
		],
	},
	theme: {
		extend: {
			colors: colors,
			fontFamily: {
				manrope: ["var(--manrope-font)", ...fontFamily.sans],
				inter: ["var(--inter-font)", ...fontFamily.sans],
			},
		},
	},
	plugins: [require("daisyui")],
} satisfies Config;
