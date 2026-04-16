import Link from "next/link";

import { StoreStatus } from "@/components/store-status";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.18),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(20,184,166,0.12),_transparent_28%),linear-gradient(180deg,#fffaf1_0%,#f5efe5_100%)] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-white/60 bg-[#fff8ef]/85 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <Link href="/" className="font-display text-xl tracking-tight text-slate-950 sm:text-2xl">
              KOPILIH
            </Link>
            <p className="text-xs text-slate-600 sm:text-sm">
              Kurasi cafe yang terasa tepat, dekat, dan layak dikunjungi lagi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <StoreStatus />
            <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-700">
              <Link href="/" className="rounded-full px-3 py-2 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-300">
                Discover
              </Link>
              <Link href="/submit" className="rounded-full px-3 py-2 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-300">
                Submit
              </Link>
              <Link href="/admin/submissions" className="rounded-full bg-slate-950 px-4 py-2 text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300">
                Admin
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
