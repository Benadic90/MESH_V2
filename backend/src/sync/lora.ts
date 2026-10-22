
import { Router, Request, Response } from "express";
import { createSosRequest, listRequests } from "../store";

const MAX_IMPORT_ITEMS = 100;
const MAX_RESPONSE_BYTES = 1_048_576; // 1 MB
const ALLOWED_RESOURCE_TYPES = [
  "ambulance",
  "medical_team",
  "fire_team",
  "shelter_unit",
  "food_supply",
] as const;

export function createSyncLoraRouter(): Router {
  const r = Router();

  // Import SOS packets from the server-configured LoRa gateway.
  r.post("/sync_lora", async (req: Request, res: Response) => {
    // Never let the request body choose the destination host.
    const ip = process.env.LORA_GATEWAY_IP || "192.168.4.1";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    try {
      const resp = await fetch(`http://${ip}/get_requests`, {
        signal: controller.signal,
        redirect: "error",
      });

      if (!resp.ok) {
        res.status(502).json({
          success: false,
          error: `LoRa gateway HTTP ${resp.status}`,
        });
        return;
      }

      const contentLength = Number(resp.headers.get("content-length") || 0);
      if (contentLength > MAX_RESPONSE_BYTES) {
        res.status(502).json({
          success: false,
          error: "LoRa gateway response is too large",
        });
        return;
      }

      if (!resp.body) {
        res.status(502).json({
          success: false,
          error: "LoRa gateway returned an empty response",
        });
        return;
      }

      // Enforce the response limit even when Content-Length is missing.
      const reader = resp.body.getReader();
      const chunks: Uint8Array[] = [];
      let totalBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        totalBytes += value.byteLength;
        if (totalBytes > MAX_RESPONSE_BYTES) {
          await reader.cancel();
          res.status(502).json({
            success: false,
            error: "LoRa gateway response is too large",
          });
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
        res.status(502).json({
          success: false,
          error: "LoRa gateway returned invalid JSON",
        });
        return;
      }

      if (
        !body ||
        typeof body !== "object" ||
        !Array.isArray((body as { data?: unknown }).data)
      ) {
        res.status(502).json({
          success: false,
          error: "LoRa gateway response has an invalid format",
        });
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

      // Deduplicate against existing requests and earlier packets in this batch.
      const existing = listRequests();
      const known = new Set(
        existing.map((item) => `${item.location.area}\u0000${item.message}`)
      );

      for (const raw of items) {
        if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;

        const item = raw as Record<string, unknown>;
        if (typeof item.message !== "string") continue;

        const message = item.message.trim();
        if (message.length < 5 || message.length > 1000) continue;

        const location =
          item.location &&
          typeof item.location === "object" &&
          !Array.isArray(item.location)
            ? (item.location as Record<string, unknown>)
            : {};

        const area =
          typeof location.area === "string" ? location.area.trim() : "";

        if (area.length < 2 || area.length > 120) continue;

        const signature = `${area}\u0000${message}`;
        if (known.has(signature)) continue;

        const lat = location.lat;
        const lng = location.lng;

        const contactNumber =
          typeof item.contactNumber === "string" &&
          item.contactNumber.trim().length >= 7 &&
          item.contactNumber.trim().length <= 20
            ? item.contactNumber.trim()
            : undefined;

        const peopleCount =
          typeof item.peopleCount === "number" &&
          Number.isInteger(item.peopleCount) &&
          item.peopleCount >= 1 &&
          item.peopleCount <= 500
            ? item.peopleCount
            : 1;

        const neededResources = Array.isArray(item.neededResources)
          ? [
              ...new Set(
                item.neededResources.filter(
                  (value): value is (typeof ALLOWED_RESOURCE_TYPES)[number] =>
                    typeof value === "string" &&
                    (ALLOWED_RESOURCE_TYPES as readonly string[]).includes(value)
                )
              ),
            ].slice(0, 5)
          : [];

        const hopCount =
          typeof item.hopCount === "number" &&
          Number.isInteger(item.hopCount) &&
          item.hopCount >= 0 &&
          item.hopCount <= 5
            ? item.hopCount
            : 0;

        const sos = createSosRequest({
          reporterName: contactNumber
            ? `Victim (${contactNumber})`
            : "LoRa Victim",
          contactNumber,
          location: {
            area,
            ...(typeof lat === "number" &&
            Number.isFinite(lat) &&
            lat >= -90 &&
            lat <= 90
              ? { lat }
              : {}),
            ...(typeof lng === "number" &&
            Number.isFinite(lng) &&
            lng >= -180 &&
            lng <= 180
              ? { lng }
              : {}),
          },
          message,
          peopleCount,
          neededResources,
          hopCount,
        });

        known.add(signature);
        totalHops += hopCount;

        if (req.app.locals.io) {
          req.app.locals.io.emit("sos_created", sos);
        }

        imported++;
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
        error:
          "Cannot reach the configured LoRa gateway. Check gateway power and Wi-Fi.",
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
