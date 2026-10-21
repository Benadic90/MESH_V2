/**
 * TRACK 3 — BENADIC90
 * Screen 7: Active Emergency — Live Radar Map + Status Timeline + Emergency Meta
 */
import { useRouter } from "next/router";

export default function ActiveEmergencyPage() {
  const router = useRouter();
  const sosId = (router.query.id as string) || "#RM-2026-0427-001";

  const timelineSteps = [
    { label: "SOS Sent", time: "09:42 AM", status: "done" as const },
    { label: "Received by nearby devices", time: "09:43 AM", status: "done" as const },
    { label: "Forwarded to command center", time: "09:45 AM", status: "center-node" as const },
    { label: "Responders on the way", time: "Pending...", status: "pending" as const },
  ];

  return (
    <>
      <div className="subpage-header">
        <button className="back-btn" onClick={() => router.push("/")} aria-label="Go back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="subpage-title">Active Emergency</h1>
      </div>

      {/* ── Emergency Meta Card ── */}
      <div className="active-status-top-card">
        <div className="active-status-siren-box">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v9c0 .6.4 1 1 1h2" />
            <circle cx="7" cy="17" r="2" />
            <path d="M9 17h6" />
            <circle cx="17" cy="17" r="2" />
          </svg>
        </div>
        <div className="active-status-meta">
          <div className="active-status-types">Medical + Fire + Food + Shelter</div>
          <div className="active-status-people">2 people in danger</div>
          <div className="active-status-id-code">{sosId}</div>
        </div>
        <span className="high-severity-pill">High</span>
      </div>

      {/* ── Live Aerial Satellite Map ── */}
      <div className="aerial-map-box" style={{ marginBottom: 18 }}>
        <div className="aerial-canvas">
          <div className="live-map-badge">
            <span className="live-pulse-dot" />
            <span>Live</span>
          </div>
          <div className="radar-ring outer" />
          <div className="radar-ring inner" />
          <div className="aerial-pin">📍</div>
          <div className="map-zoom-controls">
            <button className="zoom-btn">+</button>
            <button className="zoom-btn">−</button>
          </div>
        </div>
        <div className="coords-bar-card" style={{ border: "none", borderTop: "1px solid var(--border)", borderRadius: 0, marginBottom: 0 }}>
          <div className="coords-bar-left">
            <span className="coords-pin-icon">📍</span>
            <div className="coords-text-main">27.7089° N, 85.3227° E (± 8 m)</div>
          </div>
        </div>
      </div>

      {/* ── Status Timeline ── */}
      <h3 className="timeline-section-title">Status</h3>
      <div className="timeline-list">
        {timelineSteps.map((step, idx) => (
          <div key={idx} className="timeline-item-row">
            {idx < timelineSteps.length - 1 && (
              <div
                className={`timeline-vertical-stem ${
                  step.status === "done" ? "done" : ""
                }`}
              />
            )}
            <div className="timeline-stem-wrap">
              <div className={`timeline-circle-icon ${step.status}`}>
                {step.status === "done" ? (
                  "✓"
                ) : step.status === "center-node" ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  </svg>
                ) : (
                  "·"
                )}
              </div>
            </div>
            <div className="timeline-text-content">
              <span className="timeline-label-main">{step.label}</span>
              <span className="timeline-label-time">{step.time}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
