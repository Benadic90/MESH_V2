// ─────────────────────────────────────────────
// RESCUE-MESH V2 — Express App (Track 2)
// ─────────────────────────────────────────────
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import {
  assignResource,
  createSosRequest,
  getRequest,
  listRequests,
  listResources,
  sanitizeAssignmentForSocket,
  sanitizeSosForSocket,
} from "./store";
import { assignResourceSchema, sendSosSchema } from "./validation";
import { requireAdminAuth } from "./adminAuth";

export const app = express();

// Shared middleware parses JSON bodies and permits cross-origin API calls.
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Liveness endpoint for checking that the HTTP service is responding.
app.get("/health", (_req: Request, res: Response) => {
  res.json({ success: true, message: "Backend healthy", version: "2.0.0" });
});

// Validate and store a new SOS. The live Socket.IO event is intentionally
// limited to a sanitized snapshot so the public API can remain available
// without exposing private incident details to every connected client.
app.post("/send_sos", (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = sendSosSchema.parse(req.body);
    const sos = createSosRequest(payload);
    if (req.app.locals.io) req.app.locals.io.emit("sos_created", sanitizeSosForSocket(sos));
    res.status(201).json({ success: true, data: sos });
  } catch (e) { next(e); }
});


// Return one SOS by ID, or list SOS requests optionally filtered by status.
app.get("/get_requests", requireAdminAuth, (req: Request, res: Response) => {
  const id = typeof req.query.id === "string" ? req.query.id.trim() : "";

  if (id) {
    const data = getRequest(id);

    if (!data) {
      res.status(404).json({
        success: false,
        error: "SOS request not found",
      });
      return;
    }

    res.json({ success: true, data });
    return;
  }

  const status =
    typeof req.query.status === "string" ? req.query.status : undefined;

  const data = listRequests(status);
  res.json({ success: true, count: data.length, data });
});

// Return the current resource list, including availability.
app.get("/resources", (_req: Request, res: Response) => {
  const data = listResources();
  res.json({ success: true, count: data.length, data });
});

// Assign requested or automatically selected resources to an SOS.
app.post("/assign_resource", requireAdminAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = assignResourceSchema.parse(req.body);
    const result = assignResource(payload.requestId, payload.resourceIds);
    if (req.app.locals.io) req.app.locals.io.emit("resource_assigned", sanitizeAssignmentForSocket(result));
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
});

// ── Hardware bridges (implementations in sync/; mounted in index.ts) ──
// POST /sync_esp32  -> sync/esp32.ts
// POST /sync_lora   -> sync/lora.ts
// GET  /simulate_lora -> simulation fallback (only when simulation running)

// Convert validation and known store errors into client responses; log other errors.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    res.status(400).json({ success: false, error: "Invalid request payload", details: err.flatten() });
    return;
  }
  if (err instanceof Error) {
    const map: Record<string, { status: number; message: string }> = {
      REQUEST_NOT_FOUND: { status: 404, message: "SOS request not found" },
      REQUEST_ALREADY_ASSIGNED: { status: 409, message: "SOS request already assigned" },
      RESOURCE_NOT_FOUND: { status: 404, message: "No matching resource found" },
      RESOURCE_UNAVAILABLE: { status: 409, message: "Selected resource unavailable" },
    };
    const mapped = map[err.message] || (err.message.startsWith("RESOURCE_") ? map[err.message.split(":")[0]] : undefined);
    if (mapped) { res.status(mapped.status).json({ success: false, error: mapped.message }); return; }
  }
  console.error("[backend]", err);
  res.status(500).json({ success: false, error: "Internal server error" });
});
