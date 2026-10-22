/**
 * TRACK 3 — BENADIC90
 * Messages Tab — Mesh Network Notifications & Updates
 */
import { useRouter } from "next/router";

export default function MessagesPage() {
  const router = useRouter();

  const messages = [
    {
      id: "msg-1",
      sender: "Command Center",
      text: "Ambulance Unit 02 has been dispatched to Sector 4.",
      time: "09:46 AM",
      unread: true,
      icon: "🚨",
    },
    {
      id: "msg-2",
      sender: "Mesh Node #03",
      text: "Repeater online. 5 nearby mesh nodes connected.",
      time: "09:30 AM",
      unread: true,
      icon: "📡",
    },
    {
      id: "msg-3",
      sender: "NDRF Relief Camp",
      text: "Shelter Unit A open with medical supply & clean water.",
      time: "09:15 AM",
      unread: false,
      icon: "🏠",
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
        <h1 className="subpage-title">Messages</h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              padding: "14px 16px",
              background: m.unread ? "#ffffff" : "#f8fafc",
              border: `1px solid ${m.unread ? "#cbd5e1" : "var(--border)"}`,
              borderRadius: "16px",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              boxShadow: m.unread ? "0 2px 6px rgba(0,0,0,0.04)" : "none",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              {m.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-title)" }}>
                  {m.sender}
                </span>
                <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{m.time}</span>
              </div>
              <p style={{ fontSize: 12.5, color: "var(--text-body)", marginTop: 3, lineHeight: 1.4 }}>
                {m.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
