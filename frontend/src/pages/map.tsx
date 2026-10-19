/**
 * TRACK 3 — BENADIC90 — Day 1 shell
 * Map view — premium placeholder. Track 3 adds React-Leaflet Day 2-3.
 * Keep dynamic(() => import(...), { ssr: false }) when wiring Leaflet.
 */
export default function MapPage() {
  return (
    <div>
      <div className="page-shell-header">
        <h1 className="page-shell-title">Geospatial View</h1>
        <p className="page-shell-subtitle">India-locked · severity-colored markers · live from the same SOS store</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            height: 380,
            display: "grid",
            placeItems: "center",
            background:
              "linear-gradient(180deg, var(--bg-dark) 0%, #111827 100%), radial-gradient(600px 300px at 50% 20%, rgba(68,147,248,0.08), transparent 60%)",
            backgroundBlendMode: "normal",
            borderBottom: "1px solid var(--border)",
            padding: 20,
            textAlign: "center",
          }}
        >
          <div className="empty-state" style={{ borderStyle: "solid", background: "var(--bg-card)" }}>
            <div className="empty-state-icon" aria-hidden>
              🗺️
            </div>
            <div className="empty-state-title">Interactive map lands next</div>
            <p className="empty-state-desc">
              React-Leaflet on Day 2–3 — India maxBounds, clustered severity markers, popup with{" "}
              <code>aiSummary</code>, and “Sync from ESP32” hop animation. SSR guarded via{" "}
              <code>dynamic(..., {"{ ssr: false }"})</code>.
            </p>
          </div>
        </div>
      </div>

      <p style={{ marginTop: 8, fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>
        Track 3 · frontend/src/pages/map.tsx
      </p>
    </div>
  );
}
