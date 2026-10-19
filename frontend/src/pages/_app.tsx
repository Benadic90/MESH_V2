import "../styles/globals.css";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Head from "next/head";
import { useAppStore } from "../store/meshStore";

// ── Track 3 — BENADIC90 — App shell + NDRF Navbar + OFFLINE banner + mobile ──
export default function App({
  Component,
  pageProps,
}: {
  Component: React.ComponentType<Record<string, unknown>>;
  pageProps: Record<string, unknown>;
}) {
  const router = useRouter();
  const { isOffline, toggleOfflineMode } = useAppStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const getLinkClass = (path: string) => (router.pathname === path ? "active" : "");

  useEffect(() => {
    const close = () => setIsMenuOpen(false);
    router.events?.on("routeChangeStart", close);
    return () => router.events?.off("routeChangeStart", close);
  }, [router.events]);

  return (
    <>
      <Head>
        <title>RESCUE-MESH V2 | Disaster Response Mesh</title>
        <meta name="theme-color" content="#4493f8" />
        <meta name="description" content="RESCUE-MESH V2 — Offline disaster mesh: ESP32 Wi-Fi bubble + LoRa + AI triage. Works without internet." />
        <link rel="manifest" href="/manifest.json" />
      </Head>

      <nav className="navbar">
        <div className="navbar-top">
          <Link href="/" className="navbar-brand" onClick={() => setIsMenuOpen(false)}>
            <span className="navbar-brand-dot" aria-hidden />
            RESCUE-MESH
            <span className="navbar-brand-v2">V2</span>
          </Link>
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        <div className={`nav-links ${isMenuOpen ? "open" : ""}`}>
          <Link href="/" className={getLinkClass("/")} onClick={() => setIsMenuOpen(false)}>
            Submit SOS
          </Link>
          <Link href="/status" className={getLinkClass("/status")} onClick={() => setIsMenuOpen(false)}>
            Check Status
          </Link>
          <Link href="/dashboard" className={getLinkClass("/dashboard")} onClick={() => setIsMenuOpen(false)}>
            Dashboard
          </Link>
          <Link href="/map" className={getLinkClass("/map")} onClick={() => setIsMenuOpen(false)}>
            Map
          </Link>
        </div>

        <div className={`navbar-controls ${isMenuOpen ? "open" : ""}`}>
          {isOffline && (
            <span className="offline-badge">
              <span className="offline-badge-dot" aria-hidden />
              Offline
            </span>
          )}
          <button
            onClick={toggleOfflineMode}
            style={{
              padding: "6px 14px",
              background: isOffline ? "var(--critical)" : "var(--low)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
            title={isOffline ? "Reconnect mesh network — CRDT will sync" : "Go offline — cache to IndexedDB + Yjs"}
          >
            {isOffline ? "Sync Online" : "Go Offline"}
          </button>
        </div>
      </nav>

      <main className="container">
        <Component {...pageProps} />
      </main>
    </>
  );
}
