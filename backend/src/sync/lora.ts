
import { Router, Request, Response } from "express";
import { createSosRequest, listRequests, sanitizeSosForSocket } from "../store";
import { importedSosSchema } from "../validation";
import { MAX_IMPORT_ITEMS, MAX_RESPONSE_BYTES, buildSafeGatewayUrl } from "./gateway";

export function createSyncLoraRouter(): Router {
  const r = Router();

  // Import SOS packets from the server-configured LoRa gateway.
  r.post("/sync_lora", async (req: Request, res: Response) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    try {
      const gatewayUrl = await buildSafeGatewayUrl(
        process.env.LORA_GATEWAY_IP,
        "192.168.4.1",
        "/get_requests"
      );

      const response = await fetch(gatewayUrl, {
        signal: controller.signal,
        redirect: "manual",
        headers: { Accept: "application/json" },
      });

      if (response.status >= 300 && response.status < 400) {
        throw new Error("Gateway redirected unexpectedly");
      }

      if (!response.ok) {
        res.status(502).json({ success: false, error: `LoRa gateway HTTP ${response.status}` });
        return;
      }

      const contentLength = Number(response.headers.get("content-length") || 0);
      if (contentLength > MAX_RESPONSE_BYTES) {
        res.status(502).json({ success: false, error: "LoRa gateway response is too large" });
        return;
      }

      if (!response.body) {
        res.status(502).json({ success: false, error: "LoRa gateway returned an empty response" });
        return;
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let totalBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        totalBytes += value.byteLength;
        if (totalBytes > MAX_RESPONSE_BYTES) {
          await reader.cancel();
          res.status(502).json({ success: false, error: "LoRa gateway response is too large" });
          return;
        }
        chunks.push(value);
      }

      const bytes = new Uint8Array(totalBytes);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.byteLength;
      }

      let body: unknown;
      try {
        body = JSON.parse(new TextDecoder().decode(bytes));
      } catch {
        res.status(502).json({ success: false, error: "LoRa gateway returned invalid JSON" });
        return;
      }

      if (!body || typeof body !== "object" || !Array.isArray((body as { data?: unknown }).data)) {
        res.status(502).json({ success: false, error: "LoRa gateway response has an invalid format" });
        return;
      }

      const items = (body as { data: unknown[] }).data;
      if (items.length > MAX_IMPORT_ITEMS) {
        res.status(502).json({
          success: false,
          error: `LoRa gateway returned too many packets (maximum ${MAX_IMPORT_ITEMS})`,
        });
        return;
      }

      let imported = 0;
      let totalHops = 0;
      const existing = listRequests();
      const known = new Set(existing.map((item) => `${item.location.area}\u0000${item.message}`));

      for (const raw of items) {
        if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
          continue;
        }

        const parsed = importedSosSchema.safeParse(raw);
        if (!parsed.success) {
          continue;
        }

        const item = parsed.data;
        const signature = `${item.location.area.trim()}\u0000${item.message.trim()}`;
        if (known.has(signature)) {
          continue;
        }

        const sos = createSosRequest({
          reporterName: item.reporterName ?? `Victim (${item.contactNumber ?? "unknown"})`,
          contactNumber: item.contactNumber,
          location: {
            area: item.location.area,
            ...(typeof item.location.lat === "number" ? { lat: item.location.lat } : {}),
            ...(typeof item.location.lng === "number" ? { lng: item.location.lng } : {}),
          },
          message: item.message,
          peopleCount: item.peopleCount ?? 1,
          neededResources: item.neededResources ?? [],
          hopCount: item.hopCount ?? 0,
        });

        known.add(signature);
        totalHops += sos.hopCount ?? 0;

        if (req.app.locals.io) {
          req.app.locals.io.emit("sos_created", sanitizeSosForSocket(sos));
        }

        imported += 1;
      }

      res.json({
        success: true,
        importedCount: imported,
        hopStats: {
          totalHops,
          avgHops: imported ? +(totalHops / imported).toFixed(1) : 0,
        },
        message: `LoRa: synced ${imported} packet(s), ${totalHops} total hops`,
      });
    } catch {
      res.status(502).json({
        success: false,
        error: "Cannot reach the configured LoRa gateway. Check gateway power and Wi-Fi.",
      });
    } finally {
      clearTimeout(timeout);
    }
  });

  // Return sample packets for testing without importing them.
  r.get("/simulate_lora", (req: Request, res: Response) => {
    const requestedHops = Number(req.query.hops ?? 2);
    const hops = Number.isFinite(requestedHops)
      ? Math.max(0, Math.min(5, Math.trunc(requestedHops)))
      : 2;

    const mock = [
      {
        id: `sim-${Date.now()}-1`,
        message: "Building collapsed, 5 trapped — LoRa demo",
        location: {
          area: "Sector 7 (LoRa)",
          lat: 26.8467,
          lng: 80.9462,
        },
        peopleCount: 5,
        neededResources: ["ambulance", "fire_team"],
        hopCount: hops,
        contactNumber: "9000000001",
      },
      {
        id: `sim-${Date.now()}-2`,
        message: "Flood water rising, children stranded",
        location: {
          area: "River Block (LoRa)",
          lat: 26.85,
          lng: 80.95,
        },
        peopleCount: 3,
        neededResources: ["shelter_unit"],
        hopCount: Math.max(0, hops - 1),
        contactNumber: "9000000002",
      },
    ];

    res.json({
      success: true,
      count: mock.length,
      data: mock,
      note: `Simulated LoRa mesh — hopCount=${hops}. Use POST /sync_lora to ingest via real gateway.`,
    });
  });

  return r;
}
