/**
 * TRACK 3 — BENADIC90 — Day 1 shell
 * Status lookup — premium placeholder. Day 2-3: ID input → GET /get_requests.
 */
export default function StatusPage() {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <div className="page-shell-header">
        <h1 className="page-shell-title">Check Status</h1>
        <p className="page-shell-subtitle">Enter your SOS ID — works with the same ticket from the portal or dashboard.</p>
      </div>

      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon" aria-hidden>
            🔍
          </div>
          <div className="empty-state-title">Status lookup lands next</div>
          <p className="empty-state-desc">
            Day 2–3 — ID input → <code>GET /get_requests</code> filter → <code>pending</code> vs{" "}
            <code>assigned</code> + resource names + “Help is on the way.”
          </p>
        </div>
      </div>

      <p style={{ marginTop: 8, fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>
        Track 3 · frontend/src/pages/status.tsx
      </p>
    </div>
  );
}
