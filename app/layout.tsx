import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "TokaTribe",
  description: "Liga social del entretenimiento dentro del ecosistema Toka.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} ${manrope.variable}`}>
      <body>
        <Script
          src="https://cdn.marmot-cloud.com/npm/hylid-bridge/2.10.0/index.js"
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}
