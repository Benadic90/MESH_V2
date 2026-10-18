<div align="center">

![Status](https://img.shields.io/badge/STATUS-NATIONALS_READY-success?style=for-the-badge)
![Version](https://img.shields.io/badge/VERSION-2.0.0-blue?style=for-the-badge)
![Offline](https://img.shields.io/badge/OFFLINE-READY-critical?style=for-the-badge)
![Hardware](https://img.shields.io/badge/HARDWARE-ESP32_+_LoRa-orange?style=for-the-badge)

# 🛡️ RESCUE-MESH V2

### A Modular Decentralized Response Framework for Disaster Zones

**When cell towers collapse, RESCUE-MESH keeps the last mile connected.**

*Built for Nationals — ESP32 Wi-Fi bubble + LoRa mesh + AI triage + Offline-first PWA*

[Quick Start](#-quick-start) • [Architecture](#-architecture) • [Tech Stack](#-tech-stack) • [Team Workflow](#-team-workflow) • [Demo](#-nationals-demo)

</div>

---

## 📖 Overview

**RESCUE-MESH V2** is an infrastructure-independent disaster response mesh. When earthquakes, floods, or cyclones destroy cellular networks, standard aid systems go blind. RESCUE-MESH replaces them with a network of low-cost **ESP32 nodes** that:

1. Broadcast a local Wi-Fi safety net — no internet required
2. Capture SOS signals via captive portal with offline GPS
3. Score every request with an AI priority engine (0–100)
4. Hop packets across **LoRa radio for kilometers** without any tower
5. Surface everything on a live Command Dashboard for one-click dispatch

> **V1 proved the concept** (ESP8266, Wi-Fi only). **V2 is a clean, professional rebuild on ESP32 with real LoRa mesh** — built to demo live to judges without failing.

---

## ❓ Why RESCUE-MESH?

In the first hours after a large disaster, the **Information Gap** between victims on the ground and rescue teams causes systemic failure:

- Centralized networks (4G/5G) are the first to collapse
- High-priority "last-mile" needs become invisible — shadow zones get zero aid
- Manual triage is slow — a bleeding victim behind a food request is not prioritized
- Resource tracking is fragmented across NGOs

**RESCUE-MESH eliminates Response Latency** — the time between a crisis event and the arrival of the correct resource — by making every victim visible without any infrastructure.

> *If you can see our Wi-Fi bubble, you can summon help.*

---

## ✨ Features

| Pillar | What It Does | Tech |
|--------|-------------|------|
| **Connectivity Layer** | ESP32 broadcasts open Wi-Fi `🚨 RESCUE-MESH-SOS 🚨` + DNS hijack. LoRa stitches bubbles into a km-wide mesh. | ESP32 SoftAP + DNSServer + LoRa 868 MHz |
| **Intelligence Layer** | Every SOS is auto-scored 0–100 and labeled `CRITICAL` / `HIGH` / `MEDIUM` / `LOW` so dispatch sees life-threatening cases first. | Weighted AI Engine (TS + Python mirror) |
| **Logistics Layer** | 50 resources (Ambulance, Medical Team, Fire Team, Shelter, Food Supply) with one-click dispatch and auto best-match. | Express + Socket.IO + Resource Ledger |
| **User Interface** | Two faces — **Ground-Zero App** (victim, big buttons, shaky-hands friendly) + **Command Center** (dispatcher, live stats, map). | Next.js + PWA + Leaflet |

### Offline Guarantees

Four independent persistence layers — no single failure loses a victim signal:

`ESP32 NVS Flash` → `Browser IndexedDB` → `Yjs CRDT Merge` → `Server snapshot.json`

---

## 🏗️ Architecture

```
  Victim Phones              Mesh Nodes                    Command Center
 ┌──────────┐  WiFi   ┌─────────────────────┐  WiFi/USB  ┌──────────────────────────┐
 │ Phone A  ├────────►│ ESP32 LEAF NODE A    │            │ Backend  (Express :4000) │
 │ (PWA)    │ captive │ SoftAP+DNS+NVS+API   ├─────┐      │  /send_sos /get_requests │
 └──────────┘ portal  │ + loraSend()         │     │      │  /sync_esp32 /sync_lora  │
                      └─────────┬───────────┘     │      └────────────┬─────────────┘
                                │ LoRa 868 MHz    │                   │ Socket.IO + Yjs :1234
 ┌──────────┐  WiFi   ┌──────────┴───────────┐     ▼                   ▼
 │ Phone B  ├────────►│ ESP32 REPEATER B      │ ┌────────────────┐  Frontend :3000
 │ (PWA)    │         │ RX → NVS → re-TX      │ │ GATEWAY NODE C │   SOS Form
 └──────────┘         │ hopCount < 5          │ │ LoRa RX → USB │   Dashboard
                      └───────────────────────┘ └───────┬────────┘   Map + Status
                                                        │            PWA Offline
```

**Data Flow:**

- **Online:** Victim → `POST /send_sos` → AI triage → store → `sos_created` → Dashboard live
- **Offline (ESP32):** Victim → `192.168.4.1/submit` → NVS + LoRa TX → Dashboard `Sync from ESP32` → import → dispatch
- **LoRa Mesh:** Leaf `loraSend(hopCount=0)` → Repeater `RX + hopCount++ + re-TX` → Gateway collects → `POST /sync_lora`
- **PWA Offline:** Installed app → `IndexedDB + Yjs CRDT` → `Sync Online` → auto-merge

---

## 📡 Hardware

### Minimum for Nationals Demo

| Item | Purpose |
|------|---------|
| 1× ESP32 DevKit *(or Heltec WiFi LoRa 32 V3 recommended)* | Wi-Fi bubble + LoRa mesh node |
| 1× Power bank (5V, 1A+) | Untethered demo table |
| 1× Laptop | Command center (backend + frontend + Serial Monitor) |
| 1–2× Smartphones | Victim devices for live Wi-Fi connect |

### For Full LoRa Mesh (Ideal)

| Item | Purpose |
|------|---------|
| 2–3× ESP32 + SX1276 (868 MHz) modules *or* 2× Heltec boards | Leaf → Repeater → Gateway chain |
| Jumper wires + breadboard | SPI wiring |
| Additional power banks | Per-node power |

### Pin Map (Frozen Day 1)

```
SCK 5 · MISO 19 · MOSI 27 · CS 18 · RST 14 · DIO0 26 · LED GPIO 2
Wi-Fi SoftAP :80  IP 192.168.4.1  DNS :53 wildcard "*"
LoRa 868.0 MHz  BW125  SF7  Packet <200B  hopCount max 5
```

### Range & Cost

| | Range | Cost / Node |
|--|-------|-------------|
| Wi-Fi bubble | 30–50 m per node | — |
| LoRa single hop | 2–5 km urban, 10–15 km line-of-sight | $6 (discrete) – $18 (Heltec) |
| District coverage | 20–50 nodes | <$500 total hardware |

---

## 💻 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Firmware** | ESP32 (Arduino) + WiFi / DNSServer / ESPAsyncWebServer + Preferences NVS + ArduinoJson + RadioLib | ESP32 core ≥2.0.11 |
| **Backend** | Node.js + Express + TypeScript + Zod + Socket.IO + Yjs + ws + uuid | Node ≥18 |
| **Frontend** | Next.js (Pages) + TypeScript + Zustand + y-websocket + y-indexeddb + next-pwa + Leaflet + axios | Next 13.5 |
| **PWA / Offline** | next-pwa + y-indexeddb + Yjs CRDT | — |
| **Maps** | Leaflet + React-Leaflet + OpenStreetMap + Nominatim | Leaflet 1.9 |

> No Docker, no DB server, no cloud account needed to run the demo.

---

## 📁 Project Structure

```
MESH-V2/
├── firmware/
│   └── RescueMeshESP32/
│       ├── RescueMeshESP32.ino   # ESP32 sketch — Track 1
│       └── README.md
├── backend/                      # Track 2 — Express + AI + Sync
│   ├── src/
│   │   ├── app.ts                # Express app + routes
│   │   ├── index.ts              # Server + Socket.IO + Yjs :1234
│   │   ├── types.ts              # Single source of truth — all tracks code against this
│   │   ├── validation.ts         # Zod schemas
│   │   ├── store.ts              # SOS + 50 resources + snapshot persistence
│   │   ├── priority.ts           # AI triage engine
│   │   ├── ai_engine.py          # Python mirror for Q&A
│   │   └── sync/
│   │       ├── esp32.ts          # POST /sync_esp32
│   │       └── lora.ts           # POST /sync_lora + GET /simulate_lora
│   ├── test/
│   └── package.json
├── frontend/                     # Track 3 — Next.js + PWA + Map
│   ├── src/
│   │   ├── components/           # SosForm, DashboardTable, ResourcePool, Map, Navbar
│   │   ├── pages/                # index (SOS) · dashboard · map · status
│   │   ├── store/meshStore.ts    # Zustand + Yjs + offline queue
│   │   ├── lib/                  # api.ts · yjs.ts
│   │   └── styles/globals.css    # Design tokens
│   ├── public/
│   │   ├── manifest.json
│   │   └── icons/                # PWA icons 192 / 512
│   └── package.json
├── simulation/                   # Mock ESP32 + LoRa for hardware-free testing
├── docs/                         # Architecture · API spec · Flashing guide · Demo script
├── .env.example                  # All ports + room + IPs documented
└── .gitignore
```

---

## 🚀 Quick Start

### 1. Clone

```bash
git clone https://github.com/Benadic90/MESH_V2.git
cd MESH_V2
```

### 2. Backend — `http://localhost:4000`

```bash
cd backend
npm install
cp ../.env.example .env   # edit if needed
npm run dev
# health check: http://localhost:4000/health
```

### 3. Frontend — `http://localhost:3000`

```bash
cd ../frontend
npm install
npm run dev
# open http://localhost:3000
```

### 4. Firmware — ESP32

1. Install **Arduino IDE 2.x**
2. Add ESP32 board URL in Preferences:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Install libraries via Library Manager: `ESPAsyncWebServer`, `AsyncTCP`, `ArduinoJson`, `RadioLib`
4. Open `firmware/RescueMeshESP32/RescueMeshESP32.ino`
5. Select Board: `ESP32 Dev Module` · Port: your COM port · Upload
6. Connect phone to Wi-Fi **`🚨 RESCUE-MESH-SOS 🚨`** or open `http://192.168.4.1`

### Environment & Ports (Frozen Day 1)

```
Backend Express        :4000
Frontend Next.js       :3000
Yjs WebSocket          :1234   room="rescue-mesh-room"
ESP32 SoftAP           :80     IP 192.168.4.1  DNS :53 wildcard "*"
LoRa SPI               SCK 5 MISO 19 MOSI 27 CS 18 RST 14 DIO0 26  LED GPIO 2
```

See `.env.example` for all variables.

---

## 👥 Team Workflow

**6 Members → 3 Parallel Tracks → 2 Per Track**

| Track | Lane | Folder | Owns |
|-------|------|--------|------|
| **Track 1 — Mesh Node** | 2 members | `firmware/RescueMeshESP32/` | ESP32 portal + NVS + REST API + LoRa wiring + demo rig |
| **Track 2 — Nervous System** | 2 members | `backend/` | Express + Zod + AI triage + resource ledger + sync bridges |
| **Track 3 — Command Center** | 2 members *(BENADIC90 leads)* | `frontend/` + `simulation/` + `docs/` | SOS form + dashboard + map + PWA + pitch deck |

### Git Branches

```
main              → always demo-ready
track1/firmware   → firmware pair
track2/backend    → backend pair
track3/frontend   → frontend pair
```

```bash
# Each pair
git checkout track1/firmware   # or track2/backend / track3/frontend
# work in your lane only — don't edit other tracks without PR
git add -A && git commit -m "feat(track1): captive portal hijack"
git push origin track1/firmware

# Daily integration → main
git checkout main && git merge track1/firmware
```

> **Rule:** `main` never breaks `GET /health`. Strict folder ownership — no cross-track edits without review.

### The One True SOS Shape

Every layer speaks the same packet — firmware builds it, Zod validates it, frontend renders it, LoRa carries it:

```ts
{ id, reporterName?, contactNumber?, location:{area, lat?, lng?}, message, peopleCount?, neededResources?, priorityScore, severityLabel, aiSummary?, hopCount?, createdAt, status, assignedResourceIds? }
```

Source of truth: `backend/src/types.ts` + `backend/src/validation.ts`

---

## 🧪 Nationals Demo

A judge must be able to do this **without our help** — we rehearse until all 9 pass consecutively:

| # | Check | Pass Criteria |
|---|-------|---------------|
| D1 | Bubble visible | ESP32 on power bank → phone shows `🚨 RESCUE-MESH-SOS 🚨` in <5s |
| D2 | Portal auto-opens | Phone connects → portal pops (or `192.168.4.1` fallback <5s) |
| D3 | SOS + GPS | Auto-detect GPS → SUBMIT → blue LED ×3 + Serial log |
| D4 | Dashboard sync | Coordinator `Sync from ESP32 Node` → SOS appears in <2s with severity badge |
| D5 | AI triage | `trapped + bleeding` → `CRITICAL` with tooltip `Why: ...` |
| D6 | Map pin | SOS on map at correct coords, color by severity, India-locked |
| D7 | Dispatch | Check resource → Dispatch → `PENDING → ASSIGNED` |
| D8 | Status lookup | Judge enters SOS ID → sees `Help is on the way` |
| D9 | Persistence | Unplug ESP32 → replug → `GET /get_requests` still returns SOS · Offline PWA merge works |

---

## 🗺️ Roadmap

- **Phase 1 — Now (V2):** Wi-Fi bubble + NVS + dashboard sync + simulation LoRa hop animation
- **Phase 2 — LoRa Plug-and-Play:** Flash same ESP32 with `loraSend()` after NVS save — no frontend/backend changes needed
- **Phase 3 — Post-Nationals:** SQLite/Prisma persistence · JWT + rate limit · TF Lite on ESP32 · Solar enclosures · District-scale deployment

---

## 📄 Documentation

| Doc | What |
|-----|------|
| `docs/architecture.md` | System diagram + data flows + state strategy |
| `docs/api_spec.md` | Full REST + WebSocket + ESP32 endpoint table |
| `docs/esp32_flashing_guide.md` | Wiring + Arduino IDE + flash + NVS verification |
| `docs/lora_integration.md` | LoRa wiring + packet + mesh + range test plan |
| `docs/demo_script.md` | Timed word-for-word demo script for judges |
| `MESH-MASTER-DOCUMENTATION` | Full 12-section master spec (print one per pair) |

---

## 👥 Contributors

| Member | Track | Role |
|--------|-------|------|
| **BENADIC90** | **Track 3 — Lead** | **Command Center — Shell + SOS + PWA** |
| Member 2 | Track 1 | ESP32 Core + Captive Portal |
| Member 3 | Track 1 | LoRa Mesh + Power + Demo Rig |
| Member 4 | Track 2 | Backend Core + Sync Bridge |
| Member 5 | Track 2 | AI Engine + Resource Logic |
| Member 6 | Track 3 | Dashboard + Map + Pitch Deck |

---

<div align="center">
*If you can see our Wi-Fi bubble, you can summon help.*

</div>
