/**
 * TRACK 3 — BENADIC90 — Day 1 shell
 * Victim SOS page — premium placeholder. Full SosForm (FR-01) lands Day 2-3.
 * Day 1 exit: page loads with tokens + navbar looking NDRF-grade on projector.
 */
export default function SosPage() {
  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div className="page-shell-header">
        <h1 className="page-shell-title">Submit SOS Request</h1>
        <p className="page-shell-subtitle">Ground-Zero — works offline via ESP32 Wi-Fi bubble, no internet required.</p>
      </div>

      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon" aria-hidden>
            🚨
          </div>
          <div className="empty-state-title">SOS form lands next</div>
          <p className="empty-state-desc">
            Day 2–3 — big tap targets, auto-detect GPS with offline fallback, resource chips, and offline queue.
            Contract: <code>POST /send_sos</code> with <code>SosRequestInput</code> from <code>backend/src/types.ts</code>.
          </p>
        </div>
      </div>

      <p style={{ marginTop: 8, fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>
        Track 3 · BENADIC90 · frontend/src/pages/index.tsx
      </p>
    </div>
  );
}
