# 🛡️ RESCUE-MESH V2 — Nationals-Ready LoRa Mesh Prototype

> **Same idea. Professional execution.** ESP32 Wi-Fi bubble + LoRa mesh + AI triage + Command dashboard + PWA offline.
> **Status:** Scaffold — Day 1 contracts locked. Each of the 3 tracks builds in its lane.

## Quick Start (After Scaffold)

```bash
# 1) Backend — Express + Socket.IO + Yjs :4000 + :1234
cd backend
cp ../.env.example .env   # edit if needed
npm install
npm run dev               # http://localhost:4000/health

# 2) Frontend — Next.js Pages + PWA + Leaflet :3000
cd ../frontend
npm install
npm run dev               # http://localhost:3000

# 3) Firmware — ESP32 (Arduino IDE 2.x)
# Open firmware/RescueMeshESP32/RescueMeshESP32.ino → Board ESP32 Dev Module → Upload
# Then connect phone to Wi-Fi "🚨 RESCUE-MESH-SOS 🚨" or open http://192.168.4.1
```

## Folder Lanes — No Cross-Track Edits Without PR

| Track | Who | Folder | Contract |
|-------|-----|--------|----------|
| **Track 1 — Mesh Node** | 2 members | `firmware/RescueMeshESP32/` | Exposes `GET http://192.168.4.1/get_requests` |
| **Track 2 — Nervous System** | 2 members | `backend/` | Publishes `types.ts` + Zod schemas + ports |
| **Track 3 — Command Center** | 2 members (BENADIC90 leads) | `frontend/` + `simulation/` + `docs/` + PPT | Consumes `NEXT_PUBLIC_API_URL` + `rescue-mesh-room` |

> **Rule:** `main` is always demo-ready. Branch per track: `track1/firmware`, `track2/backend`, `track3/frontend` → merge daily.

## Ports & Room (Frozen Day 1 — Don't Change)

```
Backend Express        :4000
Frontend Next.js       :3000
Yjs WebSocket          :1234  room="rescue-mesh-room"
ESP32 SoftAP           :80    IP 192.168.4.1  DNS :53 wildcard "*"
LoRa SPI               SCK 5 MISO 19 MOSI 27 CS 18 RST 14 DIO0 26  LED GPIO 2
LoRa frequency         868.0 MHz India  BW125  SF7  packet <200B  hopCount max 5
```

## The One True SOS Shape

Every layer speaks this packet — firmware builds it, Zod validates it, frontend renders it, LoRa carries it:

```ts
{ id, reporterName?, contactNumber?, location:{area, lat?, lng?}, message, peopleCount?, neededResources?, priorityScore, severityLabel, aiSummary?, hopCount?, createdAt, status, assignedResourceIds? }
```

See `backend/src/types.ts` + `backend/src/validation.ts` — that's the source of truth.

## Docs

- `docs/architecture.md` — system diagram + data flows + state strategy
- `docs/api_spec.md` — full REST + WebSocket + ESP32 endpoint table
- `docs/esp32_flashing_guide.md` — wiring + IDE + flash + NVS verification
- `docs/lora_integration.md` — LoRa wiring + packet + mesh + range test plan
- `docs/quick_start.md` — 5-minute quick start per track
- `docs/demo_script.md` — timed demo script for judges
- Root `RESCUE-MESH-V2-Master-Documentation.*` — full 12-section master doc (print one per pair)

## Definition of Done — 9 Steps (Rehearse Until All Pass)

D1 Bubble visible → D2 Portal auto-opens → D3 SOS+GPS captured → D4 Dashboard sync <2s → D5 Triage correct → D6 Map pin → D7 Dispatch → D8 Status lookup → D9 Persistence + offline merge

## Tech Stack (Locked)

ESP32 + Preferences NVS + ArduinoJson + RadioLib · Node 18 · Express 4 · TypeScript 5 · Zod · Socket.IO · Yjs 13 + y-websocket + y-indexeddb · Next 13 Pages · Zustand · next-pwa 5.6 · Leaflet 1.9 + React-Leaflet 4.2 · axios

See master documentation §5 for full decision log + rejected alternatives.

---
Prepared for BENADIC90 · Nationals Oct 2026 · V1 folder `../MESH` is untouched.
