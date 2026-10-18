/**
 * TRACK 3 — Dashboard (command center)
 * TODO: stats bar + table + resource pool + sync buttons + Socket.IO
 * Replace stub on Day 2-3.
 */
export default function DashboardPage() {
  return (
    <div>
      <h2 style={{ marginBottom: 8, fontSize: 18, fontWeight: 700 }}>Command Dashboard</h2>
      <div className="card">
        <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
          Dashboard scaffold — Track 3 implements stats, table, resource pool, and{" "}
          <code>Sync from ESP32 / LoRa Gateway</code> here. Live via <code>sos_created</code> +{" "}
          <code>resource_assigned</code>.
        </p>
      </div>
    </div>
  );
}
