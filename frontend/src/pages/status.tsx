/**
 * TRACK 3 — BENADIC90
 * Status Lookup (FR-07) — Victim enters SOS ID to check dispatch status
 */
import { useRouter } from "next/router";
import { useState } from "react";

export default function StatusPage() {
  const router = useRouter();
  const [ticketId, setTicketId] = useState("");
  const [error, setError] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = ticketId.trim();
    if (!clean) {
      setError("Please enter your SOS Request ID");
      return;
    }
    router.push(`/active?id=${encodeURIComponent(clean)}`);
  };

  return (
    <>
      <div className="subpage-header">
        <button className="back-btn" onClick={() => router.push("/")} aria-label="Go back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="subpage-title">Check SOS Status</h1>
      </div>

      <div style={{ textAlign: "center", padding: "16px 0 24px" }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#eff6ff",
            color: "#2563eb",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            marginBottom: 12,
          }}
        >
          🔍
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-title)", marginBottom: 4 }}>
          Track Your Emergency Request
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", maxWidth: 300, margin: "0 auto" }}>
          Enter your SOS Request ID to see real-time mesh relay status and dispatched rescue teams.
        </p>
      </div>

      <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-title)", marginBottom: 6 }}>
            SOS Request ID
          </label>
          <input
            type="text"
            className="form-message-box"
            style={{ height: 48, minHeight: 48, fontSize: 14, fontFamily: "monospace" }}
            placeholder="e.g. #RM-2026-0427-001 or UUID"
            value={ticketId}
            onChange={(e) => {
              setTicketId(e.target.value);
              if (error) setError("");
            }}
          />
          {error && (
            <div style={{ fontSize: 12, color: "var(--red-primary)", marginTop: 4, fontWeight: 600 }}>
              {error}
            </div>
          )}
        </div>

        <button type="submit" className="btn-red-primary">
          <span>Look Up Emergency</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </form>

      {/* Quick Access Card */}
      <div
        style={{
          background: "#f8fafc",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "16px",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-title)", marginBottom: 8 }}>
          Recent Demo Request
        </div>
        <div
          onClick={() => router.push("/active?id=%23RM-2026-0427-001")}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 12px",
            background: "#ffffff",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1e40af", fontFamily: "monospace" }}>
              #RM-2026-0427-001
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
              Medical + Fire + Food + Shelter (2 people)
            </div>
          </div>
          <span style={{ fontSize: 16, color: "var(--text-secondary)" }}>→</span>
        </div>
      </div>
    </>
  );
}
