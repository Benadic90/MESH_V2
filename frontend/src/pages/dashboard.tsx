/**
 * TRACK 3 — BENADIC90 — Day 1 shell
 * Command Dashboard — premium placeholder.
 * Day 2-3: stats bar + table + resource pool + sync buttons + Socket.IO.
 */
export default function DashboardPage() {
  return (
    <div>
      <div className="page-shell-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 className="page-shell-title">Command Dashboard</h1>
          <p className="page-shell-subtitle">Dispatch Center — live via Socket.IO · sorted by priority</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="skeleton" style={{ width: 160, height: 30, borderRadius: "var(--radius-sm)" }} aria-hidden />
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 16 }}>
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="card" style={{ padding: 14, marginBottom: 0 }}>
            <div className="skeleton" style={{ height: 10, width: 70, marginBottom: 8 }} aria-hidden />
            <div className="skeleton" style={{ height: 22, width: 40 }} aria-hidden />
          </div>
        ))}
      </div>

      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon" aria-hidden>
            📡
          </div>
          <div className="empty-state-title">Live SOS table lands next</div>
          <p className="empty-state-desc">
            Track 3 Day 2–3 — fetch + <code>sos_created</code> / <code>resource_assigned</code> live updates, severity badges,
            and Resource Pool with fleet status. Sync buttons: ESP32 + LoRa Gateway.
          </p>
        </div>
      </div>

      <p style={{ marginTop: 8, fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>
        Track 3 · frontend/src/pages/dashboard.tsx
      </p>
    </div>
  );
}
