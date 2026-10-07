import type { Metadata } from "next";

import { Outfit, JetBrains_Mono } from "next/font/google";

import "./globals.css";

import { AuthProvider } from "@descope/nextjs-sdk";

import { cn } from "@/lib/utils";

const fontSans = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MeetFlow",
    template: "%s | MeetFlow",
  },
  description:
    "MeetFlow is an AI-powered calendar assistant for scheduling, rescheduling, and managing meetings.",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  const projectId =
    process.env.NEXT_PUBLIC_DESCOPE_PROJECT_ID ?? "";

  const cookieOptions = {
    sameSite: "Lax" as const,
    secure: process.env.NODE_ENV !== "development",
  };

  return (
    <AuthProvider
      projectId={projectId}
      sessionTokenViaCookie={cookieOptions}
      refreshTokenViaCookie={cookieOptions}
    >
      <html
        lang="en"
        suppressHydrationWarning
        className="h-full"
      >
        <body
          className={cn(
            fontSans.variable,
            fontMono.variable,
            "min-h-full font-sans antialiased",
          )}
        >
          {children}
        </body>
      </html>
    </AuthProvider>
  );
}