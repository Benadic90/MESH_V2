/**
 * TRACK 3 — BENADIC90
 * Screen: More / Settings — Offline toggle, device diagnostics, and Command Center link
 */
import { useRouter } from "next/router";
import { useAppStore } from "../store/meshStore";

export default function MorePage() {
  const router = useRouter();
  const { isOffline, toggleOfflineMode } = useAppStore();

  return (
    <>
      <div className="subpage-header">
        <button className="back-btn" onClick={() => router.push("/")} aria-label="Go back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="subpage-title">Settings & Diagnostics</h1>
      </div>

      {/* Network Mode Card */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "16px",
          marginBottom: "12px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-title)" }}>
              Mesh Network Mode
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
              {isOffline ? "Operating offline (IndexedDB CRDT cache)" : "Connected to ESP32 Wi-Fi Bubble"}
            </div>
          </div>
          <button
            onClick={() => toggleOfflineMode()}
            style={{
              padding: "8px 16px",
              borderRadius: "999px",
              border: "none",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              color: "#ffffff",
              background: isOffline ? "var(--red-primary)" : "#10b981",
            }}
          >
            {isOffline ? "Go Online" : "Go Offline"}
          </button>
        </div>
      </div>

      {/* Switch to Command Center (for Judges & Dispatchers) */}
      <div
        style={{
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: "16px",
          padding: "16px",
          marginBottom: "12px",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 14, color: "#1e40af", marginBottom: 2 }}>
          Dispatch / Command Center
        </div>
        <div style={{ fontSize: 12, color: "#3b82f6", marginBottom: 12 }}>
          Open the dispatcher view (table, fleet pool & LoRa sync)
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="btn-white-outline"
          style={{ height: 42, fontSize: 13 }}
        >
          Open Command Dashboard →
        </button>
      </div>

      {/* Device Info */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "16px",
          marginBottom: "12px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-title)", marginBottom: 8 }}>
          Node Information
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Hardware:</span>
            <span style={{ fontWeight: 600, color: "var(--text-title)" }}>ESP32 DevKit V1 (SoftAP)</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Radio:</span>
            <span style={{ fontWeight: 600, color: "var(--text-title)" }}>LoRa SX1276 (868 MHz India)</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Gateway IP:</span>
            <span style={{ fontWeight: 600, color: "var(--text-title)" }}>192.168.4.1</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>App Version:</span>
            <span style={{ fontWeight: 600, color: "var(--text-title)" }}>RESCUE-MESH V2.0</span>
          </div>
        </div>
      </div>
    </>
  );
}
