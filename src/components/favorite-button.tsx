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
      <span className="inline-flex items-center rounded-full border border-white/70 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-900">
        Save
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center rounded-full border px-3 py-2 text-sm font-semibold transition ${
        active
          ? "border-amber-500 bg-amber-500 text-white"
          : "border-white/70 bg-white/90 text-slate-900 hover:bg-white"
      }`}
      aria-pressed={active}
      aria-label={active ? "Remove from favorites" : "Save to favorites"}
    >
      {active ? "Saved" : "Save"}
    </button>
  );
}