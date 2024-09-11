import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
	content: ["./src/**/*.tsx", "./src/stories/**/*.{js,ts,jsx,tsx,mdx}"],
	daisyui: {
		themes: [
			{
				cofiblocks: {
					primary: "#2D7161",
					accent: {
						red: "#E36C59",
						yellow: "#FFC222",
					},
					background: "#D9E4D4",
					secondary: {
						darkblue: "#14233B",
						darkgray: "#526970",
						lightgray: "#90A5A2",
						gray: "#CFD9D4",
						offwhite: "#F7F8F5",
					},
					status: {
						success: "#EFFBD0",
						alert: "#FEF2CC",
						error: "#FDE3CF",
					},
					successText: "#2D7161",
					alertText: "#FFC222",
					errorText: "#E36C59",
				},
			},
		],
	},
	theme: {
		extend: {
			fontFamily: {
				roboto: ["var(--roboto-font)", ...fontFamily.sans],
			},
		},
	},
	plugins: [require("daisyui")],
} satisfies Config;
