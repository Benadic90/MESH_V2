/**
 * TRACK 3 — BENADIC90
 * Screen 7: Active Emergency — Live Radar Map + Status Timeline + Dynamic Emergency Meta
 */
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAppStore } from "../store/meshStore";
import { api } from "../lib/api";

interface SosRecord {
  id: string;
  status?: "pending" | "assigned" | "resolved" | string;
  severityLabel?: "low" | "medium" | "high" | "critical" | string;
  peopleCount?: number;
  message?: string;
  neededResources?: string[];
  assignedResources?: string[];
  location?: {
    area?: string;
    lat?: number;
    lng?: number;
  };
  createdAt?: string;
}

const RESOURCE_LABELS: Record<string, string> = {
  ambulance: "Ambulance",
  medical_team: "Medical Team",
  fire_team: "Fire Team",
  food_supply: "Food & Water",
  shelter_unit: "Shelter",
};

export default function ActiveEmergencyPage() {
  const router = useRouter();
  const { id } = router.query;
  const { getLocalRequest } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [sosRecord, setSosRecord] = useState<SosRecord | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    const sosId = typeof id === "string" ? id : "";
    if (!sosId) {
      setLoading(false);
      return;
    }

    // 1. Check local Zustand / Yjs / IndexedDB store first
    const local = getLocalRequest(sosId);
    if (local) {
      setSosRecord(local as unknown as SosRecord);
      setLoading(false);
      return;
    }

    // 2. Query the backend for this specific SOS request
let isMounted = true;
api
  .get("/get_requests", { params: { id: sosId } })
  .then((res) => {
    if (!isMounted) return;
    const match: SosRecord | undefined = res.data?.data;
        if (match) {
          setSosRecord(match);
        } else if (sosId === "#RM-2026-0427-001") {
          // Demo fallback
          setSosRecord({
            id: "#RM-2026-0427-001",
            status: "pending",
            severityLabel: "high",
            peopleCount: 2,
            neededResources: ["ambulance", "fire_team", "food_supply", "shelter_unit"],
            location: {
              area: "27.7089° N, 85.3227° E",
              lat: 27.7089,
              lng: 85.3227,
            },
            createdAt: new Date().toISOString(),
          });
        } else {
          setSosRecord(null);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        if (sosId === "#RM-2026-0427-001") {
          setSosRecord({
            id: "#RM-2026-0427-001",
            status: "pending",
            severityLabel: "high",
            peopleCount: 2,
            neededResources: ["ambulance", "fire_team", "food_supply", "shelter_unit"],
            location: {
              area: "27.7089° N, 85.3227° E",
              lat: 27.7089,
              lng: 85.3227,
            },
            createdAt: new Date().toISOString(),
          });
        } else {
          setSosRecord(null);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [router.isReady, id, getLocalRequest]);

  if (loading) {
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
        <div style={{ padding: "40px 16px", textAlign: "center" }}>
          <div className="skeleton" style={{ width: "100%", height: 80, borderRadius: 16, marginBottom: 16 }} />
          <div className="skeleton" style={{ width: "100%", height: 240, borderRadius: 16, marginBottom: 16 }} />
          <div className="skeleton" style={{ width: "70%", height: 32, borderRadius: 8, margin: "0 auto" }} />
        </div>
      </>
    );
  }

  if (!sosRecord) {
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

        <div style={{ textAlign: "center", padding: "48px 16px" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🔍</div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-title)", marginBottom: 6 }}>
            SOS Request Not Found
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", maxWidth: 300, margin: "0 auto 24px" }}>
            The requested emergency record was not found in the local mesh buffer or backend registry.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button className="btn-red-primary" onClick={() => router.push("/status")}>
              Lookup Another ID
            </button>
            <button className="btn-white-outline" onClick={() => router.push("/emergency")}>
              Submit New SOS
            </button>
          </div>
        </div>
      </>
    );
  }

  const isAssigned = sosRecord.status === "assigned";
  const resourcesDisplay =
    sosRecord.neededResources && sosRecord.neededResources.length > 0
      ? sosRecord.neededResources.map((r) => RESOURCE_LABELS[r] || r).join(" + ")
      : "General Emergency";

  const formattedTime = sosRecord.createdAt
    ? new Date(sosRecord.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "Just now";

  const locationCoords =
    sosRecord.location?.lat != null && sosRecord.location?.lng != null
      ? `${sosRecord.location.lat.toFixed(4)}° N, ${sosRecord.location.lng.toFixed(4)}° E`
      : sosRecord.location?.area || "Location Attached";

  const timelineSteps = [
    { label: "SOS Sent", time: formattedTime, status: "done" as const },
    { label: "Received by nearby devices", time: "Verified", status: "done" as const },
    {
      label: "Forwarded to command center",
      time: isAssigned ? "Confirmed" : "Active node",
      status: isAssigned ? ("done" as const) : ("center-node" as const),
    },
    {
      label: isAssigned ? "Responders on the way" : "Awaiting dispatch",
      time: isAssigned ? "Dispatched" : "Pending...",
      status: isAssigned ? ("done" as const) : ("pending" as const),
    },
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
          <div className="active-status-types">{resourcesDisplay}</div>
          <div className="active-status-people">
            {sosRecord.peopleCount ?? 1} {((sosRecord.peopleCount ?? 1) === 1 ? "person" : "people")} in danger
          </div>
          <div className="active-status-id-code">{sosRecord.id}</div>
        </div>
        <span className={sosRecord.severityLabel === "critical" ? "high-severity-pill" : "high-severity-pill"}>
          {sosRecord.severityLabel ? sosRecord.severityLabel.toUpperCase() : "HIGH"}
        </span>
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
            <button className="zoom-btn" onClick={() => {}}>+</button>
            <button className="zoom-btn" onClick={() => {}}>−</button>
          </div>
        </div>
        <div className="coords-bar-card" style={{ border: "none", borderTop: "1px solid var(--border)", borderRadius: 0, marginBottom: 0 }}>
          <div className="coords-bar-left">
            <span className="coords-pin-icon">📍</span>
            <div className="coords-text-main">{locationCoords}</div>
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
