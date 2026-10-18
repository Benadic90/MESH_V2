// ─────────────────────────────────────────────
// RESCUE-MESH V2 — Priority Engine (shared contract)
// Track 2 owns the weights. Firmware mirrors inline.
// Python mirror: ai_engine.py must stay in sync.
// ─────────────────────────────────────────────
import { SosRequestInput } from "./types";

export function clampPriority(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export interface ScoreBreakdown {
  score: number;
  label: "low" | "medium" | "high" | "critical";
  summary: string;
  reasons: string[]; // for dashboard tooltip "Why CRITICAL: ..."
}

// Weighted dictionary — frozen for nationals (§7)
const WEIGHTS: Array<{ pattern: RegExp; weight: number; reason: string }> = [
  { pattern: /\b(trapped|collapsed|buried|stuck)\b/i, weight: 35, reason: "trapped/collapsed" },
  { pattern: /\b(unconscious|bleeding|critical|not breathing)\b/i, weight: 35, reason: "bleeding/unconscious" },
  { pattern: /\b(fire|explosion|burning|smoke|burn)\b/i, weight: 30, reason: "fire/burning" },
  { pattern: /\b(injured|fracture|pain|medical|hurt|wound)\b/i, weight: 20, reason: "injury/medical" },
  { pattern: /\b(child|children|pregnant|elderly|kid|baby)\b/i, weight: 15, reason: "child/elderly" },
  { pattern: /\b(no food|hungry|water|stranded|thirsty|starving)\b/i, weight: 10, reason: "food/water/stranded" },
];

export function generateAiSummary(input: SosRequestInput): string {
  const findings: string[] = [];
  if (/\b(trapped|collapsed|buried|stuck)\b/i.test(input.message)) findings.push("Potential entrapment");
  if (/\b(fire|burn|smoke|explosion)\b/i.test(input.message)) findings.push("Fire hazard");
  if (/\b(bleed|blood|unconscious|injury|hurt|critical)\b/i.test(input.message)) findings.push("Medical emergency");
  if (/\b(water|flood|drown)\b/i.test(input.message)) findings.push("Water rescue");
  if (/\b(child|children|pregnant|elderly)\b/i.test(input.message)) findings.push("Vulnerable persons");
  let s = findings.length ? findings.join(", ") + " detected. " : "";
  if (input.peopleCount && input.peopleCount > 10) s += "Mass casualty event. ";
  return s || "Standard emergency request.";
}

export function calculatePriority(input: SosRequestInput): number {
  if (input.priorityScore != null) return clampPriority(input.priorityScore);
  let score = 20;
  const msg = input.message || "";
  for (const w of WEIGHTS) if (w.pattern.test(msg)) score += w.weight;
  const pc = input.peopleCount ?? 1;
  if (pc > 1) score += Math.min(pc * 3, 20);
  if (input.neededResources?.includes("ambulance")) score += 10;
  return clampPriority(score);
}

export function getScoreBreakdown(input: SosRequestInput): ScoreBreakdown {
  const reasons: string[] = [];
  let score = 20;
  const msg = input.message || "";
  for (const w of WEIGHTS) if (w.pattern.test(msg)) { score += w.weight; reasons.push(w.reason); }
  const pc = input.peopleCount ?? 1;
  if (pc > 1) { const bonus = Math.min(pc * 3, 20); score += bonus; reasons.push(`peopleCount ${pc} (+${bonus})`); }
  if (input.neededResources?.includes("ambulance")) { score += 10; reasons.push("ambulance (+10)"); }
  score = clampPriority(score);
  const label = deriveSeverityLabel(score);
  return { score, label, summary: generateAiSummary(input), reasons };
}

export function deriveSeverityLabel(score: number): "low" | "medium" | "high" | "critical" {
  if (score >= 85) return "critical";
  if (score >= 65) return "high";
  if (score >= 40) return "medium";
  return "low";
}
