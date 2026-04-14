import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kopilih Enhanced",
  description: "Cafe discovery app dengan submission flow dan admin approval, powered by Supabase.",
  keywords: [
    "coffee shop",
    "Indonesia",
    "cafe finder",
    "Next.js",
    "Vercel",
    "Supabase",
  ],
  openGraph: {
    title: "Kopilih Enhanced",
    description: "Discover cafes, submit new spots, and test a community approval workflow.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}