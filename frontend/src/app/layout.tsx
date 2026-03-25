import type { Metadata } from "next";
import { Inter, Inria_Serif } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const inriaSerif = Inria_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "700",
});

export const metadata: Metadata = {
  title: "Turbo Notes",
  description: "Note-taking app with categories, auto-save, and voice-to-text",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${inriaSerif.variable} h-full antialiased`}
    >
      <body className="bg-beige flex h-full flex-col overflow-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
