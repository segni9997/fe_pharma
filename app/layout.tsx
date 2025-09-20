import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import dynamic from "next/dynamic";
import "./globals.css";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "PharmaCare - Pharmacy Management System",
  description:
    "Modern pharmacy management system for inventory, sales, and analytics",
  generator: "v0.app",
};

const AuthProvider = dynamic(() => import("@/lib/auth").then(mod => mod.AuthProvider), { ssr: false });

import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>
            {children}
            <ThemeToggle />
          </AuthProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
