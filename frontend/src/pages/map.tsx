/**
 * TRACK 3 — BENADIC90
 * Screen 8: Map & Nearby Helpers — Satellite Map + Helper Pins + Nearby Device Fleet
 */
import { useRouter } from "next/router";
import { useState } from "react";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "ambulance", label: "Ambulance" },
  { key: "fire_team", label: "Fire" },
  { key: "food_supply", label: "Food" },
  { key: "shelter_unit", label: "Shelter" },
] as const;

const NEARBY_DEVICES = [
  {
    key: "ambulance",
    label: "Ambulance",
    cls: "ambulance",
    count: 1,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v9c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
  },
  {
    key: "fire_team",
    label: "Fire Team",
    cls: "fire",
    count: 1,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    ),
  },
  {
    key: "food_supply",
    label: "Food & Water",
    cls: "food",
    count: 1,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8" />
        <path d="M6 5h12" />
      </svg>
    ),
  },
  {
    key: "shelter_unit",
    label: "Shelter",
    cls: "shelter",
    count: 2,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </svg>
    ),
  },
];

export default function MapPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("all");

  const totalDevices = NEARBY_DEVICES.reduce((sum, d) => sum + d.count, 0);
  const filtered =
    activeFilter === "all"
      ? NEARBY_DEVICES
      : NEARBY_DEVICES.filter((d) => d.key === activeFilter);

  return (
    <>
      <div className="subpage-header">
        <button className="back-btn" onClick={() => router.push("/")} aria-label="Go back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="subpage-title">Map & Nearby Helpers</h1>
      </div>

      {/* ── Filter Pills ── */}
      <div className="map-filter-pills-row">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`map-pill ${activeFilter === f.key ? "active" : ""}`}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Aerial Satellite Map Canvas ── */}
      <div className="aerial-map-box" style={{ height: 260, marginBottom: 16 }}>
        <div className="aerial-canvas" style={{ height: "100%" }}>
          {/* Concentric radar rings */}
          <div className="radar-ring" style={{ width: 180, height: 180 }} />
          <div className="radar-ring" style={{ width: 100, height: 100 }} />

          {/* User Location Center Pin */}
          <div className="aerial-pin">📍</div>

          {/* Helper Device Pins */}
          {(activeFilter === "all" || activeFilter === "ambulance") && (
            <div className="satellite-helper-pin ambulance" style={{ top: "25%", left: "28%" }}>
              🚑
            </div>
          )}

          {(activeFilter === "all" || activeFilter === "fire_team") && (
            <div className="satellite-helper-pin fire" style={{ bottom: "24%", right: "26%" }}>
              🔥
            </div>
          )}

          {(activeFilter === "all" || activeFilter === "food_supply") && (
            <div className="satellite-helper-pin food" style={{ top: "35%", right: "20%" }}>
              💧
            </div>
          )}

          {(activeFilter === "all" || activeFilter === "shelter_unit") && (
            <>
              <div className="satellite-helper-pin shelter" style={{ top: "22%", right: "38%" }}>
                🏠
              </div>
              <div className="satellite-helper-pin shelter" style={{ bottom: "28%", left: "32%" }}>
                🏠
              </div>
            </>
          )}

          {/* Locate crosshair button */}
          <button className="crosshair-locate-btn" aria-label="Center on my location">
            ⊕
          </button>
        </div>
      </div>

      {/* ── Nearby Devices Panel ── */}
      <div className="nearby-devices-box">
        <div className="nearby-devices-header">
          <span className="nearby-devices-title">Nearby Devices</span>
          <span className="nearby-devices-total">{totalDevices}</span>
        </div>
        {filtered.map((d) => (
          <div key={d.key} className="nearby-device-row">
            <div className="nearby-row-left">
              <div className={`nearby-dot-badge ${d.cls}`}>{d.icon}</div>
              <span className="nearby-device-name">{d.label}</span>
            </div>
            <span className="nearby-device-count">{d.count}</span>
          </div>
        ))}
      </div>
    </>
  );
}
