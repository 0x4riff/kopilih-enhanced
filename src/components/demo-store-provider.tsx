"use client";

import { createContext, useContext, useEffect, useState } from "react";

import {
  countSubmissionsByStatus,
  createSubmissionInState,
  getInitialDemoState,
  getPublicShops,
  readDemoStore,
  resetDemoStore,
  reviewSubmissionInState,
  toggleFavoriteInState,
  writeDemoStore,
} from "@/lib/demo-store";
import type {
  CoffeeSubmission,
  DemoStoreState,
  SubmissionInput,
  SubmissionStatus,
} from "@/lib/types";

type DemoStoreContextValue = {
  hydrated: boolean;
  state: DemoStoreState;
  favorites: string[];
  submissions: CoffeeSubmission[];
  publicShops: ReturnType<typeof getPublicShops>;
  favoriteShops: ReturnType<typeof getPublicShops>;
  counts: ReturnType<typeof countSubmissionsByStatus>;
  isFavorite: (slug: string) => boolean;
  toggleFavorite: (slug: string) => void;
  submitCafe: (input: SubmissionInput) => CoffeeSubmission;
  reviewSubmission: (
    id: string,
    status: SubmissionStatus,
    adminNote?: string,
  ) => CoffeeSubmission | null;
  resetDemo: () => void;
};

const DemoStoreContext = createContext<DemoStoreContextValue | null>(null);

const STORE_KEY = "kopilih:demo-store:v1";

export function DemoStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<DemoStoreState>(getInitialDemoState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readDemoStore());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    writeDemoStore(state);
  }, [hydrated, state]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORE_KEY) {
        return;
      }

      setState(readDemoStore());
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const publicShops = getPublicShops(state.submissions);
  const favoriteShops = publicShops.filter((shop) =>
    state.favorites.includes(shop.slug),
  );
  const counts = countSubmissionsByStatus(state.submissions);

  const value: DemoStoreContextValue = {
    hydrated,
    state,
    favorites: state.favorites,
    submissions: state.submissions,
    publicShops,
    favoriteShops,
    counts,
    isFavorite: (slug) => state.favorites.includes(slug),
    toggleFavorite: (slug) => {
      setState((current) => toggleFavoriteInState(current, slug));
    },
    submitCafe: (input) => {
      let created: CoffeeSubmission | null = null;

      setState((current) => {
        const next = createSubmissionInState(current, input);
        created = next.submission;
        return next.state;
      });

      if (!created) {
        throw new Error("Failed to create submission");
      }

      return created;
    },
    reviewSubmission: (id, status, adminNote) => {
      let updated: CoffeeSubmission | null = null;

      setState((current) => {
        const next = reviewSubmissionInState(current, id, status, adminNote);
        updated = next.submission;
        return next.state;
      });

      return updated ?? null;
    },
    resetDemo: () => {
      setState(resetDemoStore());
    },
  };

  return (
    <DemoStoreContext.Provider value={value}>
      {children}
    </DemoStoreContext.Provider>
  );
}

export function useDemoStore() {
  const context = useContext(DemoStoreContext);

  if (!context) {
    throw new Error("useDemoStore must be used within DemoStoreProvider");
  }

  return context;
}
