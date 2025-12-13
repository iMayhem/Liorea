import type { Metadata } from "next";
import './globals.css';
import { Providers } from "./Providers";
import DisableContextMenu from "@/components/DisableContextMenu";

import { Inter, Roboto, Lato, Montserrat, Open_Sans, Poppins, Oswald, Playfair_Display, Merriweather, Space_Mono } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const roboto = Roboto({ weight: ["300", "400", "500", "700"], subsets: ["latin"], variable: "--font-roboto" });
const lato = Lato({ weight: ["300", "400", "700"], subsets: ["latin"], variable: "--font-lato" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans" });
const poppins = Poppins({ weight: ["300", "400", "600"], subsets: ["latin"], variable: "--font-poppins" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const merriweather = Merriweather({ weight: ["300", "400", "700"], subsets: ["latin"], variable: "--font-merriweather" });
const spaceMono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-space-mono" });

export const metadata: Metadata = {
  title: "Liorea",
  description: "Your personalized virtual workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${roboto.variable} ${lato.variable} ${montserrat.variable} ${openSans.variable} ${poppins.variable} ${oswald.variable} ${playfair.variable} ${merriweather.variable} ${spaceMono.variable}`}>
      <head>
        <link rel="icon" href="https://pub-cb3ee67ac9934a35a6d7ddc427fbcab6.r2.dev/favicon/favicon.svg" />
      </head>
      <body className="font-body antialiased h-screen w-screen overflow-hidden select-none">
        <DisableContextMenu />
        <Providers>
          <div className="hidden md:block h-full w-full">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}