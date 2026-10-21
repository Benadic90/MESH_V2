import "../styles/globals.css";
import Head from "next/head";
import { useRouter } from "next/router";
import BottomNav from "../components/BottomNav";

// Only wizard steps in /emergency hide the bottom navigation bar
const NO_NAV_PAGES = ["/emergency"];

export default function App({
  Component,
  pageProps,
}: {
  Component: React.ComponentType<Record<string, unknown>>;
  pageProps: Record<string, unknown>;
}) {
  const router = useRouter();
  const showNav = !NO_NAV_PAGES.some((p) => router.pathname.startsWith(p));

  return (
    <>
      <Head>
        <title>RESCUE-MESH | Help · Connect · Save Lives</title>
        <meta name="theme-color" content="#ffffff" />
        <meta
          name="description"
          content="RESCUE-MESH — Offline disaster mesh: ESP32 Wi-Fi bubble + LoRa + AI triage. Works without internet."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="manifest" href="/manifest.json" />
      </Head>

      <div className="app-container">
        {/* Top iOS-style status bar time/icons */}
        <div className="top-status-bar">
          <span>9:41</span>
          <div className="status-bar-icons">
            <svg width="15" height="11" viewBox="0 0 16 12" fill="currentColor">
              <path d="M0 10h2V2H0v8zm4 0h2V4H4v6zm4 0h2V6H8v4zm4 0h2V0h-2v10z" />
            </svg>
            <svg width="15" height="11" viewBox="0 0 16 12" fill="currentColor">
              <path d="M8 2.5C5.2 2.5 2.7 3.7.9 5.6L0 4.7C2.1 2.5 5 1 8 1s5.9 1.5 8 3.7l-.9.9C13.3 3.7 10.8 2.5 8 2.5zm0 3C6.1 5.5 4.4 6.3 3.1 7.6l-.9-.9c1.5-1.5 3.5-2.4 5.8-2.4s4.3.9 5.8 2.4l-.9.9C11.6 6.3 9.9 5.5 8 5.5zm0 3c-1.1 0-2.1.5-2.8 1.2L8 12l2.8-2.3c-.7-.7-1.7-1.2-2.8-1.2z" />
            </svg>
            <svg width="22" height="11" viewBox="0 0 24 12" fill="currentColor">
              <rect x="1" y="1" width="19" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <rect x="3" y="3" width="13" height="6" rx="1.5" />
              <path d="M22 4.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <main className={`app-main ${showNav ? "" : "no-nav"}`}>
          <Component {...pageProps} />
        </main>

        {showNav && <BottomNav messageBadge={3} />}
      </div>
    </>
  );
}
