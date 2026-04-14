"use client";

import { useEffect, useState } from "react";
import { getFavorites } from "@/lib/demo-store";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());

    const handleStorage = () => {
      setFavorites(getFavorites());
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return { favorites, isFavorite: (slug: string) => favorites.includes(slug) };
}