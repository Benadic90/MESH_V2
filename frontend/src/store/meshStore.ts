// ─────────────────────────────────────────────
// RESCUE-MESH V2 — Zustand mesh store (Track 3)
// Yjs + IndexedDB + REST queue fallback
// ─────────────────────────────────────────────
import { create } from "zustand";
import { yRequestsMap, wsProvider, connectYjs, disconnectYjs } from "../lib/yjs";

interface MeshState {
  isOffline: boolean;
  toggleOfflineMode: () => void;
  cacheOfflineRequest: (payload: Record<string, unknown>) => void;
  offlineRequests: unknown[];
}

export const useAppStore = create<MeshState>((set, get) => ({
  isOffline: false,
  offlineRequests: [],

  toggleOfflineMode: async () => {
    const { isOffline } = get();
    if (isOffline) {
      set({ isOffline: false });
      connectYjs();
    } else {
      set({ isOffline: true });
      disconnectYjs();
    }
  },

  cacheOfflineRequest: (payload: Record<string, unknown>) => {
    const id = `local-${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2, 9)}`;
    yRequestsMap.set(id, { ...payload, id, status: "pending", severityLabel: "medium", hopCount: 0 });
    set((s) => ({ offlineRequests: [...s.offlineRequests, payload] }));
  },
}));

export { yRequestsMap };
