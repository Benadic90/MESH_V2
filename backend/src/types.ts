// ─────────────────────────────────────────────
// RESCUE-MESH V2 — Single Source of Truth: Types
// Published by Track 2 on Day 1. All 3 tracks code against this.
// ─────────────────────────────────────────────

export type RequestStatus = "pending" | "assigned";

// Resource categories accepted in requests and assigned by the store.
export type ResourceType =
  | "ambulance"
  | "medical_team"
  | "fire_team"
  | "shelter_unit"
  | "food_supply";

export interface LocationPayload {
  area: string;        // 2–120 chars, required
  lat?: number;        // -90..90
  lng?: number;        // -180..180
}

// Fields accepted when a caller creates an SOS.
export interface SosRequestInput {
  reporterName?: string;                  // 2–80 optional
  contactNumber?: string;                 // 7–20 optional
  location: LocationPayload;
  message: string;                        // 5–1000 *
  peopleCount?: number;                   // 1–500
  neededResources?: ResourceType[];       // max 5
  priorityScore?: number;                 // 0–100 computed if absent
  severityLabel?: "low" | "medium" | "high" | "critical";
  aiSummary?: string;
  hopCount?: number;                      // 0 on creation, ++ per LoRa hop, max 5
}

// A stored SOS adds server-owned identity, status, timestamps, and assignments.
export interface SosRequest extends SosRequestInput {
  id: string;
  status: RequestStatus;
  priorityScore: number;
  severityLabel: "low" | "medium" | "high" | "critical";
  aiSummary?: string;
  hopCount?: number;
  createdAt: string; // ISO
  assignedResourceIds?: string[];
}

// A dispatchable team or supply unit.
export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  area: string;
  available: boolean;
}

// Result returned after a successful resource assignment.
export interface AssignmentResult {
  request: SosRequest;
  resources: Resource[];
}

// LoRa packet helpers
export const MAX_HOP_COUNT = 5;
export const MAX_LORA_BYTES = 200;
export const LORA_FREQUENCY_MHZ = 868.0; // India
