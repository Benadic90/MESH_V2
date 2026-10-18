import "../styles/globals.css";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Head from "next/head";
import { useAppStore } from "../store/meshStore";

export default function App({ Component, pageProps }: { Component: React.ComponentType<Record<string, unknown>>; pageProps: Record<string, unknown> }) {
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
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <nav className="navbar">
        <div className="navbar-top">
          <div style={{ fontSize: 15, fontWeight: 700, color: "#e5534b", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: "#e5534b", display: "inline-block" }} />
            RESCUE-MESH
            <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500, marginLeft: 6, letterSpacing: 1 }}>V2</span>
          </div>
          <button className="mobile-menu-btn" onClick={() => setIsMenuOpen((v) => !v)} aria-label="Toggle menu">
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>
        <div className={`nav-links ${isMenuOpen ? "open" : ""}`}>
          <Link href="/" className={getLinkClass("/")}>Submit SOS</Link>
          <Link href="/status" className={getLinkClass("/status")}>Check Status</Link>
          <Link href="/dashboard" className={getLinkClass("/dashboard")}>Dashboard</Link>
          <Link href="/map" className={getLinkClass("/map")}>Map</Link>
        </div>
        <div className={`navbar-controls ${isMenuOpen ? "open" : ""}`} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isOffline && (
            <span style={{ color: "#e5534b", fontSize: 12, fontWeight: 600, padding: "4px 10px", background: "rgba(229,83,75,0.1)", borderRadius: 4, border: "1px solid rgba(229,83,75,0.3)" }}>
              OFFLINE
            </span>
          )}
          <button onClick={toggleOfflineMode} style={{ padding: "6px 14px", background: isOffline ? "#e5534b" : "#46954a", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
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
