/**
 * TRACK 3 — BENADIC90
 * Screen 1: Home Screen — HELP NOW button + 2x2 Resource quick-select + Mesh network status
 */
import { useRouter } from "next/router";
import { useAppStore } from "../store/meshStore";

const RESOURCES = [
  {
    key: "ambulance",
    label: "Ambulance",
    desc: "Medical help",
    cls: "ambulance",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v9c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <path d="M9 17h6" />
        <circle cx="17" cy="17" r="2" />
        <path d="M9 10h4" />
        <path d="M11 8v4" />
      </svg>
    ),
  },
  {
    key: "fire_team",
    label: "Fire Team",
    desc: "Fire / Rescue",
    cls: "fire",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    ),
  },
  {
    key: "food_supply",
    label: "Food & Water",
    desc: "Essential supplies",
    cls: "food",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8" />
        <path d="M6 5h12" />
        <path d="M12 5v11" />
        <path d="M12 20h.01" />
      </svg>
    ),
  },
  {
    key: "shelter_unit",
    label: "Shelter",
    desc: "Safe place",
    cls: "shelter",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
] as const;

export default function HomePage() {
  const router = useRouter();
  const { isOffline } = useAppStore();

  const handleHelpNow = () => {
    router.push("/emergency");
  };

  const handleQuickResource = (resourceKey: string) => {
    router.push(`/emergency?preselect=${resourceKey}`);
  };

  return (
    <>
      {/* ── Top Header ── */}
      <div className="home-header">
        <div className="home-brand-wrap">
          <div className="home-brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.93 4.93a10 10 0 0 1 14.14 0" />
              <path d="M7.76 7.76a6 6 0 0 1 8.48 0" />
              <circle cx="12" cy="12" r="2" />
              <path d="M12 14v8" />
            </svg>
          </div>
          <div>
            <div className="home-brand-title">RESCUE-MESH</div>
            <div className="home-brand-subtitle">Help · Connect · Save Lives</div>
          </div>
        </div>
        <button
          className="home-gear-btn"
          aria-label="Settings"
          onClick={() => router.push("/more")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* ── Mesh Network Status Card ── */}
      <div className={`mesh-status-card ${isOffline ? "offline" : ""}`}>
        <div className="mesh-indicator-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12h2a8 8 0 0 1 8-8v2a6 6 0 0 0-6 6H2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <div className="mesh-status-info">
          <div className="mesh-status-heading">Mesh Network</div>
          <div className="mesh-status-detail">
            {isOffline ? "Disconnected · Offline mode" : "Connected · 3 nearby devices"}
          </div>
        </div>
        {!isOffline && (
          <div className="mesh-signal-bars" title="Strong mesh signal">
            <div className="mesh-signal-bar" style={{ height: "4px" }} />
            <div className="mesh-signal-bar" style={{ height: "7px" }} />
            <div className="mesh-signal-bar" style={{ height: "10px" }} />
            <div className="mesh-signal-bar" style={{ height: "14px" }} />
          </div>
        )}
      </div>

      {/* ── HELP NOW Hero Button ── */}
      <div className="hero-help-wrap">
        <button className="hero-help-btn" onClick={handleHelpNow} aria-label="HELP NOW">
          <div className="hero-siren-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v3M4.93 4.93l2.12 2.12M19.07 4.93l-2.12 2.12" />
              <path d="M6 10a6 6 0 0 1 12 0v7H6v-7z" />
              <path d="M4 17h16" />
              <path d="M9 21h6" />
            </svg>
          </div>
          <span className="hero-help-text">HELP NOW</span>
          <span className="hero-help-sub">Tap to send an emergency alert</span>
        </button>
      </div>

      {/* ── 2x2 Resource Quick Grid ── */}
      <div className="resource-2x2-grid">
        {RESOURCES.map((r) => (
          <div
            key={r.key}
            className={`res-quick-card ${r.cls}`}
            onClick={() => handleQuickResource(r.key)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleQuickResource(r.key)}
          >
            <div className="res-quick-icon-circle">{r.icon}</div>
            <div>
              <div className="res-quick-title">{r.label}</div>
              <div className="res-quick-subtitle">{r.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
