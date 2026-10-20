// ─────────────────────────────────────────────
// RESCUE-MESH V2 — Single Source of Truth: Validation
// Zod schemas — backend enforces, frontend + firmware mirror.
// ─────────────────────────────────────────────
import { z } from "zod";

const resourceTypes = [
  "ambulance",
  "medical_team",
  "fire_team",
  "shelter_unit",
  "food_supply",
] as const;

// Public SOS input constraints; trim user-entered text before validating lengths.
export const sendSosSchema = z.object({
  reporterName: z.string().trim().min(2).max(80).optional(),
  contactNumber: z.string().trim().min(7).max(20).optional(),
  location: z.object({
    area: z.string().trim().min(2).max(120),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
  }),
  message: z.string().trim().min(5).max(1000),
  peopleCount: z.number().int().min(1).max(500).optional(),
  neededResources: z.array(z.enum(resourceTypes)).max(5).optional(),
  priorityScore: z.number().min(0).max(100).optional(),
  severityLabel: z.enum(["low", "medium", "high", "critical"]).optional(),
  hopCount: z.number().int().min(0).max(5).optional(),
});

// Requires the SOS ID and optionally accepts explicit resource IDs to reserve.
export const assignResourceSchema = z.object({
  requestId: z.string().trim().min(1),
  resourceIds: z.array(z.string().trim().min(1)).optional(),
});

// Optional device address for the ESP32 bridge, with its default access-point IP.
export const syncEsp32Schema = z.object({
  ip: z.string().trim().min(7).max(45).default("192.168.4.1"),
});

// Optional LoRa gateway settings; the port is available for gateway configuration.
export const syncLoraSchema = z
  .object({
    gatewayIp: z.string().trim().min(7).max(45).default("192.168.4.1"),
    port: z.number().int().min(1).max(65535).optional(),
  })
  .optional();

export type SendSosInput = z.infer<typeof sendSosSchema>;
export type AssignResourceInput = z.infer<typeof assignResourceSchema>;
