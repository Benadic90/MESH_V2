import { describe, expect, it } from "vitest";
import { calculatePriority, deriveSeverityLabel } from "../src/priority";

// Regression checks for the shared priority rules and severity boundaries.
describe("priority engine", () => {
  it("collapsed + trapped => critical", () => {
    const s = calculatePriority({ message: "Building collapsed, 5 people trapped inside", peopleCount: 5, location: { area: "A" }, neededResources: ["ambulance"] });
    expect(s).toBeGreaterThanOrEqual(85);
    expect(deriveSeverityLabel(s)).toBe("critical");
  });
  it("hungry solo => low/medium", () => {
    const s = calculatePriority({ message: "No food for two days, we are hungry", peopleCount: 1, location: { area: "B" } });
    expect(s).toBeLessThan(65);
  });
  it("fire + bleeding + children => critical", () => {
    const s = calculatePriority({ message: "Fire in shelter, children bleeding badly", peopleCount: 4, location: { area: "C" } });
    expect(deriveSeverityLabel(s)).toBe("critical");
  });
  it("respects explicit priorityScore passthrough", () => {
    expect(calculatePriority({ message: "hi", location: { area: "X" }, priorityScore: 42 })).toBe(42);
  });
  it("clamps 0..100", () => {
    expect(calculatePriority({ message: "x", location: { area: "X" }, priorityScore: 999 })).toBe(100);
    expect(calculatePriority({ message: "x", location: { area: "X" }, priorityScore: -5 })).toBe(0);
  });
  it("label thresholds", () => {
    expect(deriveSeverityLabel(90)).toBe("critical");
    expect(deriveSeverityLabel(70)).toBe("high");
    expect(deriveSeverityLabel(45)).toBe("medium");
    expect(deriveSeverityLabel(10)).toBe("low");
  });
});
