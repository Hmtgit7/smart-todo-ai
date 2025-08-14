import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { RootLayout } from "@/components/layout/RootLayout";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Todo - AI-Powered Task Management",
  description:
    "Intelligent task management with AI-powered prioritization and context analysis",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <RootLayout>{children}</RootLayout>
      </body>
    </html>
  );
}
