// Deprecated — kept as placeholder to avoid import errors in existing code.
// All functionality moved to:
//   - Supabase (cafes + cafe_submissions tables) for data
//   - src/lib/demo-store.ts (localStorage favorites only)
export const DemoStoreProvider = ({ children }: { children: React.ReactNode }) => children;
export function useDemoStore() {
  return {
    hydrated: true,
    favorites: [],
    counts: { pending: 0, approved: 0, rejected: 0 },
    isFavorite: () => false,
    toggleFavorite: () => {},
    submitCafe: () => { throw new Error("Deprecated"); },
    reviewSubmission: () => null,
    resetDemo: () => {},
  };
}