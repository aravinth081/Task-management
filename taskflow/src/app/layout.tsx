import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TaskFlow — Enterprise Task Management",
  description:
    "Premium enterprise-grade task management platform. Plan, track, and deliver projects with your team using Kanban boards, sprints, and AI-powered insights.",
  keywords: [
    "task management",
    "project management",
    "kanban",
    "agile",
    "scrum",
    "team collaboration",
  ],
  authors: [{ name: "TaskFlow" }],
  openGraph: {
    title: "TaskFlow — Enterprise Task Management",
    description:
      "Premium enterprise-grade task management platform for modern teams.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
