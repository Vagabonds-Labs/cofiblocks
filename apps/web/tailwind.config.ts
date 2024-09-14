// tailwind.config.js
import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
	content: [
		"./src/**/*.tsx",
		"./src/stories/**/*.{js,ts,jsx,tsx,mdx}",
		"../../packages/ui/**/*{.js,.ts,.jsx,.tsx}",
	],
	daisyui: {
		themes: [
			{
				cofiblocks: {
					primary: "#2D7161",
					"primary-dark": "#2C6557",
					"primary-light": "#EAF1EF",

					secondary: "#FFC222",
					"secondary-dark": "#E5B02B",
					"secondary-light": "#FFF9E8",

					accent: "#E36C59",
					"accent-focus": "#D65B47",
					"accent-content": "#ffffff",

					neutral: "#040A0A",
					"neutral-focus": "#0A1A16",
					"neutral-content": "#ffffff",

					"base-100": "#ffffff",
					"base-200": "#EAF1EF",
					"base-300": "#F5E6E6",
					"base-content": "#040A0A",

					info: "#2094f3",
					success: "#009485",
					warning: "#ff9900",
					error: "#ff5724",
				},
			},
		],
	},
	theme: {
		extend: {
			colors: {
				primary: {
					DEFAULT: "#2D7161",
					dark: "#2C6557",
					light: "#EAF1EF",
				},
				secondary: {
					DEFAULT: "#FFC222",
					dark: "#E5B02B",
					light: "#FFF9E8",
				},
				accent: "#E36C59",
				text: {
					DEFAULT: "#040A0A",
					dark: "#0A1A16",
				},
			},
			fontFamily: {
				manrope: ["var(--manrope-font)", ...fontFamily.sans],
				inter: ["var(--inter-font)", ...fontFamily.sans],
			},
		},
	},
	plugins: [require("daisyui")],
} satisfies Config;
