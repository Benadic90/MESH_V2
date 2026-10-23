
import { Request, Response, Router } from "express";
import { createSosRequest, listRequests, sanitizeSosForSocket } from "../store";
import { importedSosSchema } from "../validation";
import { MAX_IMPORT_ITEMS, MAX_RESPONSE_BYTES, buildSafeGatewayUrl } from "./gateway";

export function createSyncEsp32Router(): Router {
  const r = Router();

  r.post("/sync_esp32", async (req: Request, res: Response) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    try {
      const gatewayUrl = await buildSafeGatewayUrl(
        process.env.ESP32_GATEWAY_IP,
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
        res.status(502).json({ success: false, error: `ESP32 HTTP ${response.status}` });
        return;
      }

      const contentLength = Number(response.headers.get("content-length") || 0);
      if (contentLength > MAX_RESPONSE_BYTES) {
        res.status(502).json({ success: false, error: "ESP32 response is too large" });
        return;
      }

      if (!response.body) {
        res.status(502).json({ success: false, error: "ESP32 returned an empty response" });
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
          res.status(502).json({ success: false, error: "ESP32 response is too large" });
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
        res.status(502).json({ success: false, error: "ESP32 returned invalid JSON" });
        return;
      }

      if (!body || typeof body !== "object" || !Array.isArray((body as { data?: unknown }).data)) {
        res.status(502).json({ success: false, error: "ESP32 response has an invalid format" });
        return;
      }

      const items = (body as { data: unknown[] }).data;
      if (items.length > MAX_IMPORT_ITEMS) {
        res.status(502).json({
          success: false,
          error: `ESP32 returned too many requests (maximum ${MAX_IMPORT_ITEMS})`,
        });
        return;
      }

      const existing = listRequests();
      const known = new Set(existing.map((item) => `${item.location.area}\u0000${item.message}`));
      let imported = 0;

      for (const raw of items) {
        if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
          continue;
        }

        const parsed = importedSosSchema.safeParse(raw);
        if (!parsed.success) {
          continue;
        }

        const item = parsed.data;
        const area = item.location.area.trim();
        const signature = `${area}\u0000${item.message.trim()}`;
        if (known.has(signature)) {
          continue;
        }

        const sos = createSosRequest({
          reporterName: item.reporterName ?? `Victim (${item.contactNumber ?? "unknown"})`,
          contactNumber: item.contactNumber,
          location: {
            area,
            ...(typeof item.location.lat === "number" ? { lat: item.location.lat } : {}),
            ...(typeof item.location.lng === "number" ? { lng: item.location.lng } : {}),
          },
          message: item.message,
          peopleCount: item.peopleCount ?? 1,
          neededResources: item.neededResources ?? [],
          hopCount: item.hopCount ?? 0,
        });

        known.add(signature);
        if (req.app.locals.io) req.app.locals.io.emit("sos_created", sanitizeSosForSocket(sos));
        imported += 1;
      }

      res.json({
        success: true,
        importedCount: imported,
        message: `Synced ${imported} request(s) from the configured ESP32 gateway`,
      });
    } catch {
      res.status(502).json({
        success: false,
        error: "Cannot reach the configured ESP32 gateway. Check the device connection.",
      });
    } finally {
      clearTimeout(timeout);
    }
  });

  return r;
}
