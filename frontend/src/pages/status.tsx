/**
 * TRACK 3 — Status lookup (victim checks SOS by ID)
 * TODO: ID input → GET /get_requests filter → pending/assigned + resource names
 */
export default function StatusPage() {
  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 8, fontSize: 18, fontWeight: 700 }}>Check Status</h2>
      <div className="card">
        <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
          Status lookup scaffold — Track 3 wires ID input → GET /get_requests here.
        </p>
      </div>
    </div>
  );
}
