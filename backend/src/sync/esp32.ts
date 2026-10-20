// ─────────────────────────────────────────────
// RESCUE-MESH V2 — ESP32 Sync Bridge (Track 2)
// GET http://{ip}/get_requests  → dedup → createSosRequest → emit
// Also handles direct browser fallback path.
// ─────────────────────────────────────────────
import { Router, Request, Response } from "express";
import { createSosRequest, listRequests } from "../store";

export function createSyncEsp32Router(): Router {
  const r = Router();

  // Fetch SOS data from the device and import only records not already in the store.
  r.post("/sync_esp32", async (req: Request, res: Response) => {
    const ip = typeof req.body?.ip === "string" ? req.body.ip : "192.168.4.1";
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 4000);
      const resp = await fetch(`http://${ip}/get_requests`, { signal: ctrl.signal });
      clearTimeout(t);
      if (!resp.ok) { res.status(502).json({ success: false, error: `ESP32 HTTP ${resp.status}` }); return; }
      const body: unknown = await resp.json();
      const items: unknown[] = (body as { data?: unknown[] })?.data ?? [];
      let imported = 0;
      const existing = listRequests();
      for (const raw of items as Array<Record<string, unknown>>) {
        if (!raw?.message || typeof raw.message !== "string") continue;
        const area = (raw.location as { area?: string } | undefined)?.area ?? "Disaster Zone";
        const dup = existing.some((e) => e.id === raw.id || (e.message === raw.message && e.location?.area === area));
        if (dup) continue;
        const sos = createSosRequest({
          reporterName: (raw.contactNumber ? `Victim (${raw.contactNumber})` : "ESP32 Offline Victim") as string,
          contactNumber: raw.contactNumber as string | undefined,
          location: {
            area,
            lat: (raw.location as { lat?: number } | undefined)?.lat,
            lng: (raw.location as { lng?: number } | undefined)?.lng,
          },
          message: raw.message as string,
          peopleCount: (raw.peopleCount as number) || 1,
          neededResources: (raw.neededResources as string[] | undefined) as never,
          hopCount: (raw.hopCount as number | undefined) ?? 0,
        });
        if (req.app.locals.io) req.app.locals.io.emit("sos_created", sos);
        imported++;
      }
      res.json({ success: true, importedCount: imported, message: `Synced ${imported} request(s) from ESP32 ${ip}` });
    } catch (err: unknown) {
      res.status(502).json({ success: false, error: `Cannot reach ESP32 at ${ip}. Connect Wi-Fi to "🚨 RESCUE-MESH-SOS 🚨" and retry.` });
    }
  });

  return r;
}
