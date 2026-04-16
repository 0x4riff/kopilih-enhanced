import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "KOPILIH",
  description: "Temukan cafe Indonesia yang terasa tepat untuk kerja, meeting santai, dan kembali lagi.",
  keywords: ["coffee shop", "Indonesia", "cafe finder", "location based cafe", "Supabase"],
  openGraph: {
    title: "KOPILIH",
    description: "Temukan cafe Indonesia yang terasa tepat, dengan kurasi, lokasi, dan community flow.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
