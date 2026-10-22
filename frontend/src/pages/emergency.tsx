/**
 * TRACK 3 — BENADIC90
 * Emergency Wizard — 5-Step SOS Submission Flow matching Mockup Screens 2, 3, 4, 5, 6
 * Step 1: Emergency Details (resource selection + people count)
 * Step 2: Location (GPS auto-detect / manual / map preview)
 * Step 3: Confirm & Send (summary review)
 * Step 4: Sending... (animated mesh relay progress)
 * Step 5: Sent (success confirmation with ID)
 */
import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "../store/meshStore";
import { api } from "../lib/api";

interface ResourceCount {
  ambulance: number;
  fire_team: number;
  food_supply: number;
  shelter_unit: number;
  medical_team: number;
}

interface LocationData {
  method: "gps" | "manual" | "map";
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  area: string;
}

interface SosResult {
  id: string;
  createdAt: string;
}

const RESOURCE_CONFIG = [
  {
    key: "ambulance" as const,
    label: "Ambulance / Medical Team",
    desc: "Injured, illness, medical emergency",
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
    key: "fire_team" as const,
    label: "Fire Team",
    desc: "Fire, explosion, rescue",
    cls: "fire",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    ),
  },
  {
    key: "food_supply" as const,
    label: "Food & Water",
    desc: "Food, clean water, essential supplies",
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
    key: "shelter_unit" as const,
    label: "Shelter",
    desc: "Safe place to stay",
    cls: "shelter",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
];

const QUICK_MESSAGE_SUGGESTIONS = [
  "People trapped",
  "Medical emergency / Bleeding",
  "Water level rising",
  "Elderly & children here",
  "Building collapsed",
  "Need immediate rescue",
];

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="back-btn" onClick={onClick} aria-label="Go back">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </button>
  );
}

export default function EmergencyPage() {
  const router = useRouter();
  const { isOffline, cacheOfflineRequest } = useAppStore();

  const [step, setStep] = useState(1);
  const [resources, setResources] = useState<ResourceCount>({
    ambulance: 0,
    fire_team: 0,
    food_supply: 0,
    shelter_unit: 0,
    medical_team: 0,
  });
  const [peopleCount, setPeopleCount] = useState(1);
  const [location, setLocation] = useState<LocationData>({
    method: "gps",
    lat: null,
    lng: null,
    accuracy: null,
    area: "",
  });
  const [message, setMessage] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [sosResult, setSosResult] = useState<SosResult | null>(null);

  // Sending step animation state
  const [sendingSteps, setSendingSteps] = useState([
    { label: "Location attached", sublabel: "GPS / Landmark", status: "pending" as "done" | "active" | "pending" },
    { label: "Requirements included", sublabel: "Emergency alert", status: "pending" as "done" | "active" | "pending" },
    { label: "Sending to nearby devices", sublabel: "Mesh network (ESP32)", status: "pending" as "done" | "active" | "pending" },
    { label: "Contacting command center", sublabel: "Waiting for confirmation...", status: "pending" as "done" | "active" | "pending" },
  ]);

  // Handle preselect from home page resource cards
  useEffect(() => {
    const preselect = router.query.preselect as string;
    if (preselect && preselect in resources) {
      setResources((prev) => ({ ...prev, [preselect]: 1 }));
    }
  }, [router.query.preselect]);

  const updateResource = (key: keyof ResourceCount, delta: number) => {
    setResources((prev) => ({
      ...prev,
      [key]: Math.max(0, Math.min(10, prev[key] + delta)),
    }));
  };

  const detectGPS = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGpsError("GPS not available on this device");
      return;
    }
    setGpsLoading(true);
    setGpsError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy) || 8;
        setLocation({
          method: "gps",
          lat,
          lng,
          accuracy,
          area: `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
        });
        setGpsLoading(false);
      },
      (err) => {
        setGpsError(err.message || "Unable to acquire GPS signal. Please enter landmark manually.");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, []);

  // Trigger GPS detection when entering Step 2 if GPS method is active and coordinates are empty
  useEffect(() => {
    if (step === 2 && location.method === "gps" && location.lat === null && !gpsLoading && !gpsError) {
      detectGPS();
    }
  }, [step, location.method, location.lat, gpsLoading, gpsError, detectGPS]);

  const getSelectedResources = () => {
    const selected: string[] = [];
    if (resources.ambulance > 0) selected.push(`Ambulance (${resources.ambulance})`);
    if (resources.fire_team > 0) selected.push(`Fire Team (${resources.fire_team})`);
    if (resources.food_supply > 0) selected.push(`Food & Water (${resources.food_supply})`);
    if (resources.shelter_unit > 0) selected.push(`Shelter (${resources.shelter_unit})`);
    return selected;
  };

  const getNeededResourceTypes = () => {
    const types: string[] = [];
    if (resources.ambulance > 0) types.push("ambulance", "medical_team");
    if (resources.fire_team > 0) types.push("fire_team");
    if (resources.food_supply > 0) types.push("food_supply");
    if (resources.shelter_unit > 0) types.push("shelter_unit");
    return Array.from(new Set(types)).slice(0, 5);
  };

  const handleSubmitSOS = async () => {
    setSubmitError("");
    const derivedArea = location.area.trim() ||
      (location.lat != null && location.lng != null
        ? `${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° E`
        : "Disaster Zone");
    const derivedMessage = message.trim() ||
      `Emergency alert: ${getSelectedResources().join(", ") || "Immediate assistance requested"}. People in danger: ${peopleCount}.`;

    const payload = {
      location: {
        area: derivedArea,
        ...(location.lat != null && { lat: location.lat }),
        ...(location.lng != null && { lng: location.lng }),
      },
      message: derivedMessage,
      peopleCount,
      neededResources: getNeededResourceTypes(),
    };

    setStep(4);

    const selectedList = getSelectedResources();
    const locSub = location.lat != null && location.lng != null
      ? `${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° E`
      : derivedArea;
    const reqSub = selectedList.length > 0 ? selectedList.join(", ") : "Emergency alert";

    setSendingSteps([
      { label: "Location attached", sublabel: locSub, status: "pending" },
      { label: "Requirements included", sublabel: reqSub, status: "pending" },
      { label: "Sending to nearby devices", sublabel: "Mesh network (ESP32)", status: "pending" },
      { label: "Contacting command center", sublabel: "Waiting for confirmation...", status: "pending" },
    ]);

    // Staged animation matching Screen 5
    const animateStep = (index: number, delay: number): Promise<void> =>
      new Promise((resolve) => {
        setTimeout(() => {
          setSendingSteps((prev) =>
            prev.map((s, i) => ({
              ...s,
              status: i < index ? "done" : i === index ? "active" : "pending",
            }))
          );
          resolve();
        }, delay);
      });

    await animateStep(0, 300);
    await animateStep(1, 600);
    await animateStep(2, 600);

    try {
      let resultId = "";
      let resultTime = new Date().toISOString();

      if (isOffline) {
        resultId = cacheOfflineRequest(payload);
        setSosResult({ id: resultId, createdAt: resultTime });
      } else {
        try {
          const res = await api.post("/send_sos", payload);
          const data = res.data?.data;
          resultId = data?.id || cacheOfflineRequest(payload);
          resultTime = data?.createdAt || new Date().toISOString();
          setSosResult({ id: resultId, createdAt: resultTime });
        } catch (err: unknown) {
          const axiosErr = err as { response?: { status: number; data?: { error?: string; message?: string } } };
          if (axiosErr?.response && axiosErr.response.status >= 400 && axiosErr.response.status < 500) {
            setStep(3);
            setSubmitError(
              axiosErr.response.data?.error ||
              axiosErr.response.data?.message ||
              "Invalid request parameters. Please verify your emergency details."
            );
            return;
          }
          // Network failure fallback to offline storage
          resultId = cacheOfflineRequest(payload);
          setSosResult({ id: resultId, createdAt: resultTime });
        }
      }

      await animateStep(3, 700);
      setSendingSteps((prev) => prev.map((s) => ({ ...s, status: "done" as const })));
      setTimeout(() => setStep(5), 600);
    } catch {
      const resultId = cacheOfflineRequest(payload);
      setSosResult({ id: resultId, createdAt: new Date().toISOString() });
      await animateStep(3, 500);
      setSendingSteps((prev) => prev.map((s) => ({ ...s, status: "done" as const })));
      setTimeout(() => setStep(5), 600);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.push("/");
  };

  const hasValidLocation = Boolean(
    (location.lat != null && location.lng != null) ||
    (location.area && location.area.trim().length >= 2)
  );

  // ═══════════════════════════════════════════════
  // STEP 1: Emergency Details (Screen 2)
  // ═══════════════════════════════════════════════
  if (step === 1) {
    return (
      <>
        <div className="subpage-header">
          <BackButton onClick={handleBack} />
          <h1 className="subpage-title">Emergency Details</h1>
        </div>

        <h2 className="wizard-title">What do you need help with?</h2>
        <p className="wizard-subtitle">Select all that apply. You can update this later.</p>

        <div className="res-counter-list">
          {RESOURCE_CONFIG.map((r) => (
            <div
              key={r.key}
              className={`res-counter-card ${r.cls} ${resources[r.key] > 0 ? "has-count" : ""}`}
            >
              <div className="res-counter-icon-wrap">{r.icon}</div>
              <div className="res-counter-info">
                <div className="res-counter-name">{r.label}</div>
                <div className="res-counter-desc">{r.desc}</div>
              </div>
              <div className="counter-stepper">
                <button
                  className="stepper-btn"
                  onClick={() => updateResource(r.key, -1)}
                  disabled={resources[r.key] === 0}
                  aria-label={`Decrease ${r.label}`}
                >
                  −
                </button>
                <span className="stepper-val">{resources[r.key]}</span>
                <button
                  className="stepper-btn"
                  onClick={() => updateResource(r.key, 1)}
                  aria-label={`Increase ${r.label}`}
                >
                  +
                </button>
              </div>
            </div>
          ))}

          {/* People in danger counter */}
          <div className="res-counter-card people">
            <div className="res-counter-icon-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="res-counter-info">
              <div className="res-counter-name">People in danger</div>
              <div className="res-counter-desc">How many people need help?</div>
            </div>
            <div className="counter-stepper">
              <button
                className="stepper-btn"
                onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))}
                disabled={peopleCount <= 1}
                aria-label="Decrease people count"
              >
                −
              </button>
              <span className="stepper-val">{peopleCount}</span>
              <button
                className="stepper-btn"
                onClick={() => setPeopleCount(Math.min(500, peopleCount + 1))}
                aria-label="Increase people count"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Optional Situation Note */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text-title)" }}>
              Situation Details (Optional)
            </label>
            <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
              {message.length}/1000
            </span>
          </div>
          <textarea
            className="form-message-box"
            rows={2}
            maxLength={1000}
            placeholder="Type your emergency message... e.g. People trapped near the old bridge. Need immediate help."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <button className="btn-red-primary" onClick={() => setStep(2)}>
          <span>Next: Location</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </>
    );
  }

  // ═══════════════════════════════════════════════
  // STEP 2: Location (Screen 3)
  // ═══════════════════════════════════════════════
  if (step === 2) {
    return (
      <>
        <div className="subpage-header">
          <BackButton onClick={handleBack} />
          <h1 className="subpage-title">Location</h1>
        </div>

        <h2 className="wizard-title" style={{ fontSize: 17, marginBottom: 12 }}>
          Choose how to share your location.
        </h2>

        <div className="loc-options-list">
          {/* Option 1: Auto-detect GPS */}
          <div
            className={`loc-option-card ${location.method === "gps" ? "active" : ""}`}
            onClick={() => {
              setLocation((prev) => ({ ...prev, method: "gps" }));
              detectGPS();
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setLocation((prev) => ({ ...prev, method: "gps" }));
                detectGPS();
              }
            }}
            aria-label="Auto-detect location using GPS"
          >
            <div className="loc-option-icon gps">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
            </div>
            <div className="loc-option-text">
              <div className="loc-option-header">
                <span className="loc-option-title">Auto-detect (GPS)</span>
                <span className="best-option-pill">Best option</span>
              </div>
              <div className="loc-option-desc">
                Use your phone&apos;s location services for the most accurate position.
              </div>
            </div>
          </div>

          {/* Option 2: Select on map */}
          <div
            className={`loc-option-card ${location.method === "map" ? "active" : ""}`}
            onClick={() => {
              setLocation((prev) => ({
                ...prev,
                method: "map",
                lat: prev.lat ?? 27.7089,
                lng: prev.lng ?? 85.3227,
                area: prev.area || "27.7089° N, 85.3227° E",
              }));
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setLocation((prev) => ({
                  ...prev,
                  method: "map",
                  lat: prev.lat ?? 27.7089,
                  lng: prev.lng ?? 85.3227,
                  area: prev.area || "27.7089° N, 85.3227° E",
                }));
              }
            }}
            aria-label="Select location on map"
          >
            <div className="loc-option-icon map">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className="loc-option-text">
              <div className="loc-option-title">Select on map</div>
              <div className="loc-option-desc">Tap the map to set a location pin.</div>
            </div>
          </div>

          {/* Option 3: Manual address */}
          <div
            className={`loc-option-card ${location.method === "manual" ? "active" : ""}`}
            onClick={() => {
              setLocation((prev) => ({
                ...prev,
                method: "manual",
                lat: null,
                lng: null,
                accuracy: null,
              }));
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setLocation((prev) => ({
                  ...prev,
                  method: "manual",
                  lat: null,
                  lng: null,
                  accuracy: null,
                }));
              }
            }}
            aria-label="Enter address or landmark manually"
          >
            <div className="loc-option-icon manual">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                <line x1="8" y1="2" x2="8" y2="18" />
                <line x1="16" y1="6" x2="16" y2="22" />
              </svg>
            </div>
            <div className="loc-option-text">
              <div className="loc-option-title">Enter address / landmark</div>
              <div className="loc-option-desc">e.g. School, bridge, village name</div>
            </div>
          </div>
        </div>

        {/* Manual Address Input */}
        {location.method === "manual" && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-title)", marginBottom: 6 }}>
              Landmark or Area Description
            </label>
            <input
              type="text"
              placeholder="e.g. Old bridge, Sector 4, Riverside"
              value={location.area}
              onChange={(e) => setLocation((prev) => ({ ...prev, area: e.target.value }))}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid var(--border)",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>
        )}

        {/* GPS Error notice if present */}
        {gpsError && location.method === "gps" && (
          <div style={{ fontSize: 12, color: "var(--orange)", marginBottom: 12 }}>
            ⚠️ {gpsError}
          </div>
        )}

        {/* Aerial Satellite Map Box */}
        <div className="aerial-map-box">
          <div className="aerial-canvas">
            <div className="radar-ring outer" />
            <div className="radar-ring inner" />
            <div className="aerial-pin">📍</div>
            <div className="accuracy-floating-badge">
              <span>🎯 Accuracy: {location.accuracy || (location.lat ? 8 : "N/A")} m</span>
            </div>
            <div className="map-zoom-controls">
              <button className="zoom-btn" onClick={() => {}}>+</button>
              <button className="zoom-btn" onClick={() => {}}>−</button>
            </div>
          </div>
        </div>

        {/* Coordinates Row */}
        <div className="coords-bar-card">
          <div className="coords-bar-left">
            <span className="coords-pin-icon">📍</span>
            <div>
              <div className="coords-text-main">
                {location.lat != null && location.lng != null
                  ? `${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° E`
                  : location.area || (gpsLoading ? "Acquiring GPS location..." : "Location not set")}
              </div>
              <div className="coords-text-sub">
                {location.accuracy != null
                  ? `(± ${location.accuracy} meters)`
                  : location.area
                  ? "(Manual landmark)"
                  : "(Tap Auto-detect or enter landmark)"}
              </div>
            </div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>

        <button
          className="btn-red-primary"
          onClick={() => {
            if (!hasValidLocation) {
              if (location.method === "gps") detectGPS();
              return;
            }
            setStep(3);
          }}
          disabled={location.method === "manual" && !location.area.trim()}
        >
          {gpsLoading ? "Detecting GPS..." : "Next: Confirm & Send"}
        </button>
      </>
    );
  }

  // ═══════════════════════════════════════════════
  // STEP 3: Confirm & Send (Screen 4)
  // ═══════════════════════════════════════════════
  if (step === 3) {
    const selectedResources = getSelectedResources();
    const emergencyTypeLabel = selectedResources.length > 0
      ? selectedResources.map((r) => r.split(" (")[0]).join(" + ")
      : "General Emergency";
    const requiredResourcesLabel = selectedResources.length > 0
      ? selectedResources.join(" · ")
      : "None specified";
    const locationSummary = location.lat != null && location.lng != null
      ? `${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° E`
      : location.area.trim() || "Location not provided";

    return (
      <>
        <div className="subpage-header">
          <BackButton onClick={handleBack} />
          <h1 className="subpage-title">Confirm & Send</h1>
        </div>

        {submitError && (
          <div style={{
            background: "var(--red-soft)",
            border: "1px solid var(--red-border)",
            color: "var(--red-bright)",
            padding: "10px 14px",
            borderRadius: "10px",
            fontSize: 13,
            marginBottom: 16,
          }}>
            ⚠️ {submitError}
          </div>
        )}

        <div className="confirm-hero-box">
          <div className="confirm-siren-circle">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v3M4.93 4.93l2.12 2.12M19.07 4.93l-2.12 2.12" />
              <path d="M6 10a6 6 0 0 1 12 0v7H6v-7z" />
              <path d="M4 17h16" />
              <path d="M9 21h6" />
            </svg>
          </div>
          <h2 className="confirm-title">Emergency Alert</h2>
          <p className="confirm-subtitle">
            You are about to send a SOS request with the following details.
          </p>
        </div>

        <div className="confirm-card">
          {/* Row 1: Type */}
          <div className="confirm-row">
            <div className="confirm-icon-box">🛡️</div>
            <div className="confirm-row-body">
              <div className="confirm-row-label">Emergency type</div>
              <div className="confirm-row-value">{emergencyTypeLabel}</div>
            </div>
          </div>

          {/* Row 2: People in danger */}
          <div className="confirm-row">
            <div className="confirm-icon-box">👥</div>
            <div className="confirm-row-body">
              <div className="confirm-row-label">People in danger</div>
              <div className="confirm-row-value">{peopleCount}</div>
            </div>
          </div>

          {/* Row 3: Required resources */}
          <div className="confirm-row">
            <div className="confirm-icon-box">🎒</div>
            <div className="confirm-row-body">
              <div className="confirm-row-label">Required resources</div>
              <div className="confirm-row-value">{requiredResourcesLabel}</div>
            </div>
          </div>

          {/* Row 4: Location */}
          <div className="confirm-row">
            <div className="confirm-icon-box">📍</div>
            <div className="confirm-row-body">
              <div className="confirm-row-label">Location</div>
              <div className="confirm-row-value">
                {locationSummary}
                {location.accuracy != null && (
                  <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500, marginLeft: 4 }}>
                    (± {location.accuracy} meters)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Row 5: Message (Directly Editable for Victim) */}
          <div className="confirm-row">
            <div className="confirm-icon-box" style={{ background: "#eff6ff", color: "#3b82f6" }}>
              💬
            </div>
            <div className="confirm-row-body">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                <div className="confirm-row-label">MESSAGE (OPTIONAL)</div>
                <span style={{ fontSize: 10, color: "var(--text-secondary)", fontWeight: 600 }}>
                  {message.length}/1000
                </span>
              </div>
              <textarea
                className="confirm-message-input"
                rows={3}
                maxLength={1000}
                placeholder="Type your message here... e.g. People trapped near the old bridge. Need immediate help."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="quick-message-tags">
                <span className="quick-tag-hint">Quick add:</span>
                {QUICK_MESSAGE_SUGGESTIONS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="quick-message-tag-btn"
                    onClick={() => {
                      setMessage((prev) => {
                        const trimmed = prev.trim();
                        if (!trimmed) return tag;
                        if (trimmed.includes(tag)) return prev;
                        return `${trimmed}. ${tag}`;
                      });
                    }}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button className="btn-red-primary" onClick={handleSubmitSOS}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          <span>Send SOS</span>
        </button>

        <button className="btn-link-cancel" onClick={() => router.push("/")}>
          Cancel
        </button>
      </>
    );
  }

  // ═══════════════════════════════════════════════
  // STEP 4: Sending... (Screen 5)
  // ═══════════════════════════════════════════════
  if (step === 4) {
    return (
      <>
        <div className="subpage-header">
          <BackButton onClick={() => {}} />
          <h1 className="subpage-title">Sending...</h1>
        </div>

        <div className="sending-screen-wrap">
          {/* Circular progress with antenna */}
          <div className="sending-radar-box">
            <svg className="sending-progress-svg" viewBox="0 0 140 140">
              <circle className="sending-circle-bg" cx="70" cy="70" r="60" />
              <circle className="sending-circle-fill" cx="70" cy="70" r="60" />
            </svg>
            <div className="sending-center-icon">
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.93 4.93a10 10 0 0 1 14.14 0" />
                <path d="M7.76 7.76a6 6 0 0 1 8.48 0" />
                <circle cx="12" cy="12" r="2" />
                <path d="M12 14v8" />
              </svg>
            </div>
          </div>

          <div className="sending-hero-text">
            Your SOS is being transmitted through the mesh network.
          </div>

          {/* Checklist */}
          <div className="sending-step-list">
            {sendingSteps.map((s, i) => (
              <div key={i} className="sending-step-item">
                <div className={`step-status-icon ${s.status}`}>
                  {s.status === "done" ? "✓" : s.status === "active" ? "⟳" : "·"}
                </div>
                <div>
                  <div className="step-item-title">{s.label}</div>
                  {s.sublabel && <div className="step-item-sub">{s.sublabel}</div>}
                </div>
              </div>
            ))}
          </div>

          <div className="sending-bottom-note">
            <span>ℹ️</span>
            <span>This may take a few seconds. Keep this page open.</span>
          </div>
        </div>
      </>
    );
  }

  // ═══════════════════════════════════════════════
  // STEP 5: Sent! (Screen 6)
  // ═══════════════════════════════════════════════
  if (step === 5 && sosResult) {
    const formattedDate = sosResult.createdAt
      ? new Date(sosResult.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }) +
        " - " +
        new Date(sosResult.createdAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Just now";

    return (
      <>
        <div className="subpage-header">
          <BackButton onClick={() => router.push("/")} />
          <h1 className="subpage-title">Sent</h1>
        </div>

        <div className="sent-screen-wrap">
          <div className="sent-huge-check">✓</div>
          <h2 className="sent-headline">SOS Sent!</h2>
          <p className="sent-subhead">
            Your emergency alert has been sent with location and requirements.
          </p>

          <div className="sent-summary-card">
            {/* Request ID */}
            <div className="sent-card-row">
              <span className="sent-row-icon">🔖</span>
              <div>
                <div className="sent-row-label">Request ID</div>
                <div className="sent-row-val">{sosResult.id}</div>
              </div>
            </div>

            {/* Time */}
            <div className="sent-card-row">
              <span className="sent-row-icon">🕐</span>
              <div>
                <div className="sent-row-label">Time</div>
                <div className="sent-row-val">{formattedDate}</div>
              </div>
            </div>

            {/* Location */}
            <div className="sent-card-row">
              <span className="sent-row-icon">📍</span>
              <div>
                <div className="sent-row-label">Location</div>
                <div className="sent-row-val">
                  {location.lat != null && location.lng != null
                    ? `${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° E`
                    : location.area || "Location Attached"}
                  {location.accuracy != null && (
                    <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500, marginLeft: 4 }}>
                      (± {location.accuracy} meters)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
            <button
              className="btn-white-outline"
              onClick={() => router.push(`/active?id=${encodeURIComponent(sosResult.id)}`)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                <line x1="8" y1="2" x2="8" y2="18" />
                <line x1="16" y1="6" x2="16" y2="22" />
              </svg>
              <span>View on Map</span>
            </button>

            <button
              className="btn-white-outline"
              onClick={() => router.push(`/active?id=${encodeURIComponent(sosResult.id)}`)}
            >
              View Details
            </button>
          </div>
        </div>
      </>
    );
  }

  return null;
}
