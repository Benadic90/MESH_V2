// ─────────────────────────────────────────────
// RESCUE-MESH V2 — Zustand mesh store (Track 3)
// Yjs + IndexedDB + REST queue fallback
// ─────────────────────────────────────────────
import { create } from "zustand";
import { yRequestsMap, wsProvider, connectYjs, disconnectYjs } from "../lib/yjs";

interface MeshState {
  isOffline: boolean;
  toggleOfflineMode: () => void;
  cacheOfflineRequest: (payload: Record<string, unknown>) => string;
  getLocalRequest: (id: string) => Record<string, unknown> | null;
  offlineRequests: Array<Record<string, unknown>>;
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

  cacheOfflineRequest: (payload: Record<string, unknown>): string => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const rand = Math.floor(100 + Math.random() * 900);
    const id = `#RM-${dateStr}-${rand}`;

    const record = {
      ...payload,
      id,
      status: "pending",
      severityLabel: "high",
      hopCount: 0,
      createdAt: now.toISOString(),
    };

    yRequestsMap.set(id, record);
    set((s) => ({ offlineRequests: [...s.offlineRequests, record] }));
    return id;
  },

  getLocalRequest: (id: string): Record<string, unknown> | null => {
    if (yRequestsMap.has(id)) {
      return yRequestsMap.get(id) as Record<string, unknown>;
    }
    const found = get().offlineRequests.find((r) => r.id === id);
    return found || null;
  },
}));

export { yRequestsMap };
