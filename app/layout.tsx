import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { SecurityProvider } from "@/lib/context/SecurityContext";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SecureNet AI | Your Personal AI Cybersecurity Companion",
    template: "%s | SecureNet AI",
  },
  description:
    "Next-generation AI cybersecurity platform for proactive threat detection, vulnerability analysis, and real-time digital protection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="min-h-screen bg-[#060816] text-slate-100 antialiased selection:bg-blue-600/40 selection:text-white">
        <SecurityProvider>{children}</SecurityProvider>
      </body>
    </html>
  );
}
