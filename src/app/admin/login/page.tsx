import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_SESSION_COOKIE, hasAdminCredentials, isAdminAuthenticated, validateAdminCredentials } from "@/lib/admin-auth";

async function loginAction(formData: FormData) {
  "use server";

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!validateAdminCredentials(username, password)) {
    redirect("/admin/login?error=invalid");
  }

  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, "active", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  redirect("/admin");
}

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  const params = await searchParams;
  const hasCredentials = hasAdminCredentials();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-5xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="surface-card rounded-[36px] p-8 sm:p-10">
          <p className="editorial-kicker text-slate-400">KOPILIH admin</p>
          <h1 className="editorial-title mt-4 text-5xl font-semibold text-slate-950">Masuk ke business console.</h1>
          <p className="editorial-body mt-5 max-w-2xl text-base text-slate-600">
            Halaman admin disembunyikan dari pengguna publik. Masuk dengan username dan password internal untuk mengelola katalog, review cafe, dan modul komersial berikutnya.
          </p>

          {!hasCredentials ? (
            <div className="mt-8 rounded-[28px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
              ADMIN_USERNAME dan ADMIN_PASSWORD belum dipasang di environment. Set dulu agar login admin bisa digunakan dengan aman.
            </div>
          ) : null}

          {params.error === "invalid" ? (
            <div className="mt-8 rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
              Username atau password tidak cocok. Coba lagi.
            </div>
          ) : null}
        </section>

        <section className="surface-card rounded-[36px] p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Akses internal</p>
          <form action={loginAction} className="mt-5 space-y-5">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Username</span>
              <input
                name="username"
                type="text"
                placeholder="Masukkan username admin"
                className="mt-2 w-full rounded-[22px] border border-slate-200/90 bg-white/88 px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)] outline-none backdrop-blur transition focus:border-slate-400 focus:bg-white focus:shadow-[0_18px_38px_-28px_rgba(15,23,42,0.4)]"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Password</span>
              <input
                name="password"
                type="password"
                placeholder="Masukkan password admin"
                className="mt-2 w-full rounded-[22px] border border-slate-200/90 bg-white/88 px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)] outline-none backdrop-blur transition focus:border-slate-400 focus:bg-white focus:shadow-[0_18px_38px_-28px_rgba(15,23,42,0.4)]"
              />
            </label>
            <button type="submit" className="btn btn-primary w-full justify-center">
              Masuk ke admin
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
