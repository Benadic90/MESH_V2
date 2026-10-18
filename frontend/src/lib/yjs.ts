// ─────────────────────────────────────────────
// RESCUE-MESH V2 — Yjs setup (isolated from UI)
// Track 3 owns this file. Room must match backend/src/index.ts.
// ─────────────────────────────────────────────
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";

const YJS_WS_URL = process.env.NEXT_PUBLIC_YJS_WS_URL || "ws://localhost:1234";
const YJS_ROOM = process.env.NEXT_PUBLIC_YJS_ROOM || "rescue-mesh-room";

export const ydoc = new Y.Doc();
export const yRequestsMap = ydoc.getMap("requests");

// Browser-only providers — guard for SSR
export const indexeddbProvider =
  typeof window !== "undefined" ? new IndexeddbPersistence("rescue-mesh-db", ydoc) : null;

export const wsProvider =
  typeof window !== "undefined" ? new WebsocketProvider(YJS_WS_URL, YJS_ROOM, ydoc) : null;

export function disconnectYjs(): void { wsProvider?.disconnect(); }
export function connectYjs(): void { wsProvider?.connect(); }
