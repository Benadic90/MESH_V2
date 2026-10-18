// ─────────────────────────────────────────────
// RESCUE-MESH V2 — In-Memory Store (Track 2)
// Yjs-backed + 50 resources + snapshot persistence stub
// ─────────────────────────────────────────────
import { randomUUID } from "node:crypto";
import { calculatePriority, deriveSeverityLabel, generateAiSummary } from "./priority";
import { AssignmentResult, Resource, SosRequest, SosRequestInput } from "./types";

// ── In-memory source (Yjs wiring added Day 4-5; keep shape identical) ──
const store: Map<string, SosRequest> = new Map();

// ── Resources: 10 each × 5 types = 50 ──
const BASE_RESOURCES = [
  { name: "Ambulance", type: "ambulance" as const, area: "Sector 7" },
  { name: "Medical Team", type: "medical_team" as const, area: "Sector 9" },
  { name: "Fire Unit", type: "fire_team" as const, area: "Industrial Block" },
  { name: "Shelter Van", type: "shelter_unit" as const, area: "Central Camp" },
  { name: "Food Supply", type: "food_supply" as const, area: "Warehouse Hub" },
];
const INITIAL_RESOURCES: Resource[] = BASE_RESOURCES.flatMap((base) =>
  Array.from({ length: 10 }).map((_, i) => ({
    ...base,
    id: `res-${base.type}-${i + 1}`,
    name: `${base.name} ${i + 1}`,
    available: true,
  }))
);
let resources: Resource[] = cloneResources();
function cloneResources(): Resource[] { return INITIAL_RESOURCES.map((r) => ({ ...r })); }

// ── CRUD ──
export function createSosRequest(input: SosRequestInput): SosRequest {
  const id = randomUUID();
  const priorityScore = input.priorityScore ?? calculatePriority(input);
  const severityLabel = input.severityLabel ?? deriveSeverityLabel(priorityScore);
  const aiSummary = (input as SosRequest).aiSummary ?? generateAiSummary(input);
  const req: SosRequest = {
    ...input,
    id,
    priorityScore,
    severityLabel,
    aiSummary,
    hopCount: input.hopCount ?? 0,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  store.set(id, req);
  return req;
}

export function listRequests(status?: string): SosRequest[] {
  const all = Array.from(store.values());
  return all
    .filter((r) => !status || r.status === status)
    .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
}

export function getRequest(id: string): SosRequest | undefined {
  return store.get(id);
}

export function listResources(): Resource[] {
  return resources.slice();
}

export function assignResource(requestId: string, resourceIds?: string[]): AssignmentResult {
  const req = store.get(requestId);
  if (!req) throw new Error("REQUEST_NOT_FOUND");
  if (req.status === "assigned") throw new Error("REQUEST_ALREADY_ASSIGNED");

  let selected: Resource[] = [];
  if (resourceIds?.length) {
    for (const rid of resourceIds) {
      const res = resources.find((r) => r.id === rid);
      if (!res) throw new Error(`RESOURCE_NOT_FOUND: ${rid}`);
      if (!res.available) throw new Error(`RESOURCE_UNAVAILABLE: ${rid}`);
      selected.push(res);
    }
  } else {
    const best = findBestResource(req);
    if (!best) throw new Error("RESOURCE_NOT_FOUND");
    selected.push(best);
  }

  selected = selected.map((r) => ({ ...r, available: false }));
  const selectedIds = new Set(selected.map((r) => r.id));
  resources = resources.map((r) => (selectedIds.has(r.id) ? { ...r, available: false } : r));

  const updated: SosRequest = { ...req, status: "assigned", assignedResourceIds: selected.map((r) => r.id) };
  store.set(req.id, updated);
  return { request: updated, resources: selected };
}

export function resetStore(): void {
  store.clear();
  resources = cloneResources();
}

function findBestResource(req: SosRequest): Resource | undefined {
  const pref = req.neededResources?.[0];
  if (pref) {
    const exact = resources.find((r) => r.available && r.type === pref);
    if (exact) return exact;
  }
  return resources.find((r) => r.available);
}

// Snapshot helpers (used by index.ts interval)
export function snapshotRequests(): SosRequest[] { return Array.from(store.values()); }
export function restoreRequests(items: SosRequest[]): void {
  store.clear();
  for (const it of items) if (it.id) store.set(it.id, it);
}
export function snapshotResources(): Resource[] { return resources.slice(); }
export function restoreResources(items: Resource[]): void { resources = items.map((r) => ({ ...r })); }
