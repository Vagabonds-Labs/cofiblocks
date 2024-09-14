import { Inter, Manrope } from "next/font/google";

const manrope = Manrope({
	weight: ["700"],
	subsets: ["latin"],
	variable: "--font-manrope",
});

const inter = Inter({
	weight: ["400", "600"],
	subsets: ["latin"],
	variable: "--font-inter",
});

export default function Fonts() {
	return (
		<style jsx global>
			{`
        :root {
          --manrope-font: ${manrope.style.fontFamily};
          --inter-font: ${inter.style.fontFamily};
        }
      `}
		</style>
	);
}
