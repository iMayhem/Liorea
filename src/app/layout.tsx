import type { Metadata } from "next";
import './globals.css';
import { Providers } from "./Providers";
import DisableContextMenu from "@/components/DisableContextMenu";

import { Inter, Roboto, Lato, Montserrat, Open_Sans } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const roboto = Roboto({ weight: ["300", "400", "500", "700"], subsets: ["latin"], variable: "--font-roboto" });
const lato = Lato({ weight: ["300", "400", "700"], subsets: ["latin"], variable: "--font-lato" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans" });

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
    <html lang="en" className={`theme-blue dark ${inter.variable} ${roboto.variable} ${lato.variable} ${montserrat.variable} ${openSans.variable}`}>
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