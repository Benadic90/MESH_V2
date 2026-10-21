# INSTRUCTIONS FOR TRACK 2 (BACKEND TEAM)
**From:** Track 3 (Frontend & Command Center — Benadic90 & Phurba)  
**To:** Track 2 (Backend & AI Triage Engine — Madhav & Member D)  
**Date:** 21 October 2026  
**Status:** Active Interface Specification  

---

## 1. Overview & Team Boundary

Track 3 is maintaining a strict code boundary: **Track 3 will NOT edit `backend/` files**. All backend development, schemas, tests, and hardware bridges remain strictly within Track 2's ownership.

This document outlines the exact contracts, endpoints, real-time events, and enhancements that the Track 3 Ground-Zero App (`frontend/`) and upcoming Incident Command Center Dashboard require from the Track 2 backend service.

---

## 2. Consumed REST Endpoints

### A. `POST /send_sos` (Victim SOS Submission)
* **Status:** Working in production.
* **Payload Expected from Frontend:**
  ```json
  {
    "location": {
      "area": "27.7089° N, 85.3227° E",
      "lat": 27.7089,
      "lng": 85.3227
    },
    "message": "People trapped near the old bridge. Need immediate help.",
    "peopleCount": 2,
    "neededResources": ["ambulance", "fire_team", "food_supply", "shelter_unit"]
  }
  ```
* **Validation Rules (Zod):**
  - `location.area`: String trimmed, min 2, max 120 chars.
  - `location.lat`: Optional number between -90 and 90.
  - `location.lng`: Optional number between -180 and 180.
  - `message`: String trimmed, min 5, max 1000 chars. *(Note: Frontend auto-generates a descriptive fallback if the victim leaves it empty).*
  - `peopleCount`: Integer between 1 and 500.
  - `neededResources`: Array of enum values: `["ambulance", "medical_team", "fire_team", "shelter_unit", "food_supply"]` (max 5).
* **Expected Response:** HTTP 201
  ```json
  {
    "success": true,
    "data": {
      "id": "#RM-2026-0427-001",
      "createdAt": "2026-10-21T08:30:00.000Z",
      "status": "pending",
      "priorityScore": 88,
      "severityLabel": "critical",
      "location": { "area": "...", "lat": 27.7089, "lng": 85.3227 },
      "neededResources": ["ambulance", "fire_team"]
    }
  }
  ```
* **Error Handling:**
  - If validation fails, return **HTTP 400** with `{ "success": false, "error": "Invalid request payload", "details": ... }`.
  - Frontend checks `response.status >= 400 && response.status < 500` to prevent masking validation errors with offline caching.

---

### B. `GET /get_requests` (List & Tracking Queries)
* **Current Implementation:** Returns all requests, optionally filtered by `?status=pending|assigned|resolved`.
* **Track 3 Feature Request for Track 2:**
  - Please support single-request lookup by ID, either via:
    1. Query param: `GET /get_requests?id=:id`
    2. OR direct path: `GET /get_requests/:id`
  - When query matches, return the single request object:
    ```json
    { "success": true, "data": { "id": "#RM-...", "status": "assigned", ... } }
    ```
  - This allows `/active?id=...` and `/status` to look up individual records instantly without downloading the entire database fleet.

---

### C. `GET /resources` (Fleet Status)
* **Status:** Used by Incident Command Center to render resource inventory.
* **Expected Response:**
  ```json
  {
    "success": true,
    "count": 50,
    "data": [
      {
        "id": "amb-01",
        "type": "ambulance",
        "status": "available",
        "lat": 27.7100,
        "lng": 85.3200
      }
    ]
  }
  ```

---

### D. `POST /assign_resource` (Dispatch Command)
* **Payload:**
  ```json
  {
    "requestId": "#RM-2026-0427-001",
    "resourceIds": ["amb-01", "fire-02"]
  }
  ```
* **Expected Response:** HTTP 200 with updated SOS record and resource status set to `assigned`.

---

### E. Hardware Sync Bridges (`sync/esp32.ts` & `sync/lora.ts`)
* `POST /sync_esp32`: Triggers ESP32 buffer dump (`http://192.168.4.1/get_requests`).
* `POST /sync_lora`: Triggers LoRa serial/packet sync.
* Track 3 Command Center dashboard includes quick-action buttons to invoke these sync endpoints.

---

## 3. Real-Time Socket.IO Specifications

The Command Center (`frontend/src/pages/dashboard.tsx`) connects to `http://localhost:4000` via `socket.io-client`.

* **Events Track 2 should emit:**
  1. `sos_created`: Emitted when any new SOS arrives via HTTP, ESP32 Wi-Fi bubble, or LoRa relay.
  2. `resource_assigned`: Emitted when dispatch assigns units to an incident.
* **CORS Settings:** Ensure Socket.IO allows CORS from `http://localhost:3000` (Next.js default port) and `http://localhost:3001`.

---

## 4. Yjs CRDT Synchronization

* Track 3 uses Yjs for offline-first peer-to-peer sync:
  - WebSocket URL: `ws://localhost:1234`
  - Room name: `rescue-mesh-room`
  - Y.Map key: `rescue-mesh-requests`
* If Track 2 runs a central Yjs WebSocket server (`y-websocket`), requests cached offline by victims automatically replicate to the Command Center upon reconnecting to the local network.

---

## 5. Contact & Coordination
- **Track 3 Leads:** Benadic90 (`Member E`) & Phurba (`Member F`)
- **Next Joint Milestone:** Live end-to-end rehearsal (Victim SOS on phone $\rightarrow$ ESP32 mesh relay $\rightarrow$ Track 2 backend triage $\rightarrow$ Track 3 Command Center Dashboard display).
