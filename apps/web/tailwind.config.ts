import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],

  daisyui: {
    themes: [
      {
        cofiblocks: {
          primary: "#2D7161",
          secondary: "#FFC222",
          accent: "#E36C59",
          neutral: "#3d4451",
          "base-100": "#ffffff",
        },
      },
    ],
    theme: {
      extend: {
        fontFamily: {
          roboto: ["var(--roboto-font)", ...fontFamily.sans],
        },
      },
    },
  },

  plugins: [require("daisyui")],
} satisfies Config;
