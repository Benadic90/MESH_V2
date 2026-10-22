// ─────────────────────────────────────────────
// RESCUE-MESH V2 — LoRa Sync Bridge (Track 2)
// Same interface as esp32.ts — dashboard doesn't distinguish source.
// Gateway exposes GET /get_requests (aggregate of LoRa-received packets).
// Also mounts GET /simulate_lora?hops=3 for hardware-free testing.
// ─────────────────────────────────────────────
import { Router, Request, Response } from "express";
import { createSosRequest, listRequests } from "../store";

export function createSyncLoraRouter(): Router {
  const r = Router();

  // Real LoRa gateway ingest — same shape as ESP32, from LoRa RX node
  r.post("/sync_lora", async (req: Request, res: Response) => {
    const ip = typeof req.body?.gatewayIp === "string" ? req.body.gatewayIp : "192.168.4.1";
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 4000);
      const resp = await fetch(`http://${ip}/get_requests`, { signal: ctrl.signal });
      clearTimeout(t);
      if (!resp.ok) { res.status(502).json({ success: false, error: `LoRa gateway HTTP ${resp.status}` }); return; }
      const body: unknown = await resp.json();
      const items: unknown[] = (body as { data?: unknown[] })?.data ?? [];
      let imported = 0;
      let totalHops = 0;
      const existing = listRequests();
      for (const raw of items as Array<Record<string, unknown>>) {
        if (!raw?.message || typeof raw.message !== "string") continue;
        const area = (raw.location as { area?: string } | undefined)?.area ?? "Disaster Zone";
        const dup = existing.some((e) => e.id === raw.id);
        if (dup) continue;
        const hopCount = (raw.hopCount as number | undefined) ?? 0;
        totalHops += hopCount;
        const sos = createSosRequest({
          reporterName: (raw.contactNumber ? `Victim (${raw.contactNumber})` : "LoRa Victim") as string,
          contactNumber: raw.contactNumber as string | undefined,
          location: {
            area,
            lat: (raw.location as { lat?: number } | undefined)?.lat,
            lng: (raw.location as { lng?: number } | undefined)?.lng,
          },
          message: raw.message as string,
          peopleCount: (raw.peopleCount as number) || 1,
          neededResources: (raw.neededResources as string[] | undefined) as never,
          hopCount,
        });
        if (req.app.locals.io) req.app.locals.io.emit("sos_created", sos);
        imported++;
      }
      res.json({ success: true, importedCount: imported, hopStats: { totalHops, avgHops: imported ? +(totalHops / imported).toFixed(1) : 0 }, message: `LoRa: synced ${imported} packet(s), ${totalHops} total hops` });
    } catch {
      res.status(502).json({ success: false, error: `Cannot reach LoRa gateway at ${ip}. Check gateway power and Wi-Fi.` });
    }
  });

  // Return representative packets for UI/testing; this endpoint does not import them.
  r.get("/simulate_lora", (req: Request, res: Response) => {
    const hops = Math.max(0, Math.min(5, Number(req.query.hops ?? 2)));
    const mock = [
      { id: `sim-${Date.now()}-1`, message: "Building collapsed, 5 trapped — LoRa demo", location: { area: "Sector 7 (LoRa)", lat: 26.8467, lng: 80.9462 }, peopleCount: 5, neededResources: ["ambulance", "fire_team"], hopCount: hops, contactNumber: "9000000001" },
      { id: `sim-${Date.now()}-2`, message: "Flood water rising, children stranded", location: { area: "River Block (LoRa)", lat: 26.8500, lng: 80.9500 }, peopleCount: 3, neededResources: ["shelter_unit"], hopCount: Math.max(0, hops - 1), contactNumber: "9000000002" },
    ];
    res.json({ success: true, count: mock.length, data: mock, note: `Simulated LoRa mesh — hopCount=${hops}. Use POST /sync_lora to ingest via real gateway.` });
  });

  return r;
}
