"use client";

import { useEffect, useState } from "react";
import { getFavorites } from "@/lib/demo-store";

export function StoreStatus() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  return (
    <div className="hidden items-center gap-2 lg:flex">
      <span className="rounded-full border border-white/60 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600">
        Saved {favorites.length}
      </span>
    </div>
  );
}