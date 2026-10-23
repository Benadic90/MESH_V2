import re

# ─────────────────────────────────────────────
# RESCUE-MESH V2 — Python mirror (must match priority.ts)
# Track 2 keeps this in sync for judge Q&A.
# ─────────────────────────────────────────────

KEYWORD_WEIGHTS = [
    {"pattern": re.compile(r"\b(trapped|collapsed|buried|stuck)\b", re.IGNORECASE), "weight": 40, "reason": "trapped/collapsed"},
    {"pattern": re.compile(r"\b(unconscious|bleeding|critical|not breathing)\b", re.IGNORECASE), "weight": 35, "reason": "bleeding/unconscious"},
    {"pattern": re.compile(r"\b(fire|explosion|burning|smoke|burn)\b", re.IGNORECASE), "weight": 30, "reason": "fire/burning"},
    {"pattern": re.compile(r"\b(injured|fracture|pain|medical|hurt|wound)\b", re.IGNORECASE), "weight": 20, "reason": "injury/medical"},
    {"pattern": re.compile(r"\b(child|children|pregnant|elderly|kid|baby)\b", re.IGNORECASE), "weight": 15, "reason": "child/elderly"},
    {"pattern": re.compile(r"\b(no food|hungry|water|stranded|thirsty|starving)\b", re.IGNORECASE), "weight": 10, "reason": "food/water/stranded"},
]

# Keep the calculated score in the same 0–100 range as the TypeScript engine.
def clamp_priority(score: int) -> int:
    return max(0, min(100, round(score)))

# Apply the TypeScript scoring rules to a dictionary-shaped SOS request.
def calculate_priority(request: dict) -> int:
    if "priorityScore" in request and request["priorityScore"] is not None:
        return clamp_priority(request["priorityScore"])
    score = 20
    message = request.get("message", "")
    for rule in KEYWORD_WEIGHTS:
        if rule["pattern"].search(message):
            score += rule["weight"]
    people_count = request.get("peopleCount", 1)
    if people_count and people_count > 1:
        score += min(people_count * 3, 20)
    needed_resources = request.get("neededResources", [])
    if "ambulance" in needed_resources:
        score += 10
    return clamp_priority(score)

# Use the same score bands as priority.ts.
def derive_severity_label(priority_score: int) -> str:
    if priority_score >= 85:
        return "critical"
    if priority_score >= 65:
        return "high"
    if priority_score >= 40:
        return "medium"
    return "low"

if __name__ == "__main__":
    # These examples make it easy to check the Python mirror from the command line.
    cases = [
        {"message": "Building collapsed, 5 people trapped inside", "peopleCount": 5, "neededResources": ["ambulance", "fire_team"]},
        {"message": "No food for two days, we are hungry", "peopleCount": 3, "neededResources": ["food_supply"]},
        {"message": "Fire in the shelter, children bleeding", "peopleCount": 4, "neededResources": ["ambulance", "fire_team"]},
    ]
    for req in cases:
        score = calculate_priority(req)
        label = derive_severity_label(score)
        print(f"{req['message'][:50]:50s} -> {score:3d} {label.upper()}")
