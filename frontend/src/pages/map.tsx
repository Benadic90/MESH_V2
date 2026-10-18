/**
 * TRACK 3 — Map view (India-locked Leaflet)
 * TODO: severity-color markers + clustering + popup + tile fallback
 * Replace stub on Day 2-3. Keep dynamic import (SSR: false) when adding Leaflet.
 */
export default function MapPage() {
  return (
    <div>
      <h2 style={{ marginBottom: 8, fontSize: 18, fontWeight: 700 }}>Geospatial View</h2>
      <div className="card">
        <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
          Map scaffold — Track 3 adds React-Leaflet here (India bounds, severity markers, cluster). Keep{" "}
          <code>dynamic(() =&gt; import(...), {"{ ssr: false }"})</code> wrapper.
        </p>
      </div>
    </div>
  );
}
