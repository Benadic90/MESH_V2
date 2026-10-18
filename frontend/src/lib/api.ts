// ─────────────────────────────────────────────
// RESCUE-MESH V2 — API client (Track 3)
// All requests go through NEXT_PUBLIC_API_URL — never hard-code localhost
// ─────────────────────────────────────────────
import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
export const ESP32_IP = process.env.NEXT_PUBLIC_ESP32_IP || "192.168.4.1";
export const YJS_WS_URL = process.env.NEXT_PUBLIC_YJS_WS_URL || "ws://localhost:1234";
export const YJS_ROOM = process.env.NEXT_PUBLIC_YJS_ROOM || "rescue-mesh-room";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 6000,
  headers: { "Content-Type": "application/json" },
});
