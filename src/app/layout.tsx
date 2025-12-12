import type { Metadata } from "next";
import './globals.css';
import { Providers } from "./Providers";

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
    <html lang="en" className="theme-blue dark">
      <head>
        <link rel="icon" href="https://pub-cb3ee67ac9934a35a6d7ddc427fbcab6.r2.dev/favicon/favicon.svg" />
      </head>
      <body className="font-body antialiased h-screen w-screen overflow-hidden select-none">
        <Providers>
          <div className="hidden md:block h-full w-full">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}