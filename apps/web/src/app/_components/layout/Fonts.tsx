import { Roboto } from "next/font/google";

const roboto = Roboto({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-montserrat",
});


export default function Fonts() {
  return (
    <style jsx global>
      {`
        :root {
          --roboto-font: ${roboto.style.fontFamily};
      `}
    </style>
  );
}
