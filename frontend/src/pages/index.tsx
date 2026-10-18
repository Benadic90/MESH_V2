/**
 * TRACK 3 — SosForm (victim) · index.tsx
 * TODO: implement per FR-01 (big tap targets, GPS, Zod-shaped payload, toast)
 * Stubs render immediately so `npm run dev` + build never break on scaffold.
 * Replace this stub with the full form when Track 3 starts Day 2.
 */
export default function SosPage() {
  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 8, fontSize: 18, fontWeight: 700 }}>Submit SOS Request</h2>
      <div className="card">
        <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
          Victim SOS form — scaffold. Track 3 will implement the full form (GPS, resource chips, offline queue, toast) here.
        </p>
        <p style={{ marginTop: 10, fontSize: 12, color: "var(--text-muted)" }}>
          Contract: POST <code>/send_sos</code> with <code>SosRequestInput</code> shape from <code>backend/src/types.ts</code>.
        </p>
      </div>
    </div>
  );
}
