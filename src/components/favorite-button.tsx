"use client";

import { useEffect, useState } from "react";
import { getFavorites, toggleFavorite as toggleFavoriteStorage } from "@/lib/demo-store";

export function FavoriteButton({ slug }: { slug: string }) {
  const [active, setActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setActive(getFavorites().includes(slug));
    setMounted(true);
  }, [slug]);

  function handleClick() {
    const next = toggleFavoriteStorage(slug);
    setActive(next.includes(slug));
  }

  if (!mounted) {
    return (
      <span className="btn btn-secondary">
        Simpan
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`btn ${active ? "btn-primary" : "btn-secondary"}`}
      aria-pressed={active}
      aria-label={active ? "Hapus dari simpanan" : "Simpan cafe"}
    >
      {active ? "Tersimpan" : "Simpan"}
    </button>
  );
}