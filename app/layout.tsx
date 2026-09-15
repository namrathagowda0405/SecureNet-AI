import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SecureNet AI",
  description: "AI-Powered Network Security & Threat Intelligence Platform",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
