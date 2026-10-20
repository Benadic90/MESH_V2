DAY_1
Date: 19 October 2026
Track: Track 2 --- Backend
Branch: working
Repository: MESH_V2
Working directory: D:\BCA v sem\mesh\MESH_V2\backend
1. Work completed today
Environment and startup
- Configured npm's cache to use D:\npm-cache because the C: drive
  had no free space.
- Installed backend dependencies successfully with npm install (275
  packages added).
- Compiled the TypeScript backend with npm run build.
- Confirmed that backend\dist\index.js exists.
- Started the development server with npm run dev.
- Confirmed the backend API is listening on port 4000.
- Confirmed the Yjs WebSocket server is listening on port 1234,
  room rescue-mesh-room.
- Tested GET /health; it returned success: true,
  message: Backend healthy, version 2.0.0.
API checks
- GET /resources returned 50 resources.
- GET /get_requests initially returned zero requests.
- Submitted a fictional test SOS using POST /send_sos.
- Retrieved the created SOS with GET /get_requests.
- Assigned an ambulance using POST /assign_resource.
- Verified the request status changed to assigned and the selected
  ambulance became unavailable.
2. Test SOS details
This was a synthetic development test, not a real emergency.
- Request ID: 86432dc2-2da1-4635-a1e6-250b2857dbbc
- Area: Sector 1
- Message: Person trapped under collapsed building and injured
- People count: 2
- Requested resources: ambulance, medical team
- Priority score returned: 91/100
- Severity returned: critical
- Initial status: pending
- Final status: assigned
- Assigned resource ID: res-ambulance-1
- Assigned resource name: Ambulance 1
- Resource area: Sector 7
- Resource availability after assignment: false
3. Verification summary
  Check                   Result                  Evidence
  npm dependency          Passed                  npm install added 275
  installation                                    packages

  TypeScript build        Passed                  npm run build;
                                                  dist\index.js exists

  Backend startup         Passed                  Server listening on
                                                  port 4000

  Yjs WebSocket startup   Passed                  Listening on port 1234

  Health endpoint         Passed                  /health returned
                                                  healthy, version 2.0.0

  Resource listing        Passed                  /resources returned
                                                  50 resources

  SOS creation and        Passed                  One test SOS was
  retrieval                                       returned by
                                                  /get_requests

  Priority/severity       Passed for this test    Score 91, severity
  calculation             case                    critical

  Resource assignment     Passed                  Request became
                                                  assigned;
                                                  res-ambulance-1
                                              became unavailable
4. Issues and cautions
- The first npm install failed because the C: drive was full. The
  npm cache was moved to D:\npm-cache, and the next install
  succeeded.
- npm reported 17 dependency vulnerabilities (3 low, 4 moderate, 8
  high, 2 critical) and deprecation warnings. Do not run
  npm audit fix --force without reviewing the proposed changes
  first.
- npm warned that install scripts for esbuild and leveldown were
  not yet covered by allowScripts. The backend did build and start,
  but this warning should be reviewed if related runtime problems
  appear.
- An assignment attempt using the guessed ID ambulance-1 failed.
  Inspecting the API showed that the real ID is res-ambulance-1;
  retrying with the real ID succeeded.
- The assigned ambulance is now marked unavailable in the running
  in-memory backend. Do not assume this test data persists after a
  server restart until persistence is tested. Reset/restore test data
  only in coordination with the team.
5. What has not been verified yet
- ESP32 synchronization against a real device.
- LoRa gateway synchronization against real hardware or a
  representative packet.
- Offline queueing and delivery/retry behavior across devices.
- Frontend display of SOS updates and live Socket.IO events.
- Data persistence across a backend restart.
- End-to-end behavior when the internet/cellular network is
  unavailable.
- Whether Yjs collaboration is connected to the SOS/resource store.
- Security review of device-sync endpoints and imported payloads.
6. Proposed next task
Recommended next task: inspect and test the existing ESP32 and LoRa
synchronization routes without changing code first.

Suggested sequence: 1. Review src/sync/esp32.ts and
src/sync/lora.ts. 2. Confirm the payload format and endpoint behavior
with the firmware team. 3. Use a safe test payload/device to test
synchronization. 4. Check validation, duplicate handling, timeouts, and
error responses. 5. Record results before implementing fixes.
7. Items to request from other tracks before the next task
From Track 1 --- Firmware / ESP32 / LoRa
Please share or confirm: - The exact SOS JSON payload produced by the
ESP32, including field names and data types. - ESP32 access-point IP and
the actual device endpoint path (for example, whether /get_requests is
supported). - How SOS records are stored offline and retried when a
connection becomes available. - The LoRa packet schema, gateway
endpoint/IP, maximum payload size, hop-count field, and sample packet. -
A redacted sample payload or simulator output, plus steps to reproduce a
sync test. - Expected behavior for duplicate messages, invalid packets,
and unreachable gateways.
From Track 3 --- Frontend / Documentation
Please share or confirm: - The frontend API base URL and how it is
configured for local testing. - The API contract the frontend expects
for /send_sos, /get_requests, /resources, and
/assign_resource. - Which Socket.IO events the frontend listens for
and the expected event payloads. - The intended status/priority fields
shown in the dashboard. - Any existing API specification or integration
test instructions, so Track 2 can align with the team's agreed contract.

DAY_2
Date: 20 October 2026
Track: Track 2 — Backend / AI triage
Repository: Benadic90/MESH_V2
Working branch: working
Summary
Verified the backend build and health endpoint, confirmed that the previously created SOS request remains available with its assignment, and exercised the hardware-free LoRa simulation endpoint. The automated test suite still has one failing priority-engine test that needs review before changing scoring rules.
Work completed and verified
1. TypeScript build
- Ran npm run build from the backend directory.
- Result: Passed — TypeScript compilation completed without errors.
2. Automated tests
- Ran npm test.
- Result: 5 tests passed, 1 test failed.
- Failing test: priority engine > collapsed + trapped => critical.
- The test expected a score of at least 85, but the observed score was 80 for the test case Building collapsed, 5 people trapped inside with peopleCount: 5 and neededResources: ["ambulance"].
- The test suite therefore is not fully passing. Scoring thresholds or weights were not changed during this work. Review the intended scoring rules with the team before modifying them.
3. Backend health endpoint
- Checked GET http://localhost:4000/health.
- Result: Passed. Response reported success: true, message: "Backend healthy", and version: "2.0.0".
4. Existing SOS state
- Checked GET http://localhost:4000/get_requests.
- Result: Passed. The API returned one saved test SOS request:
  - Reporter: Test Victim
  - Area: Sector 1
  - Message: Person trapped under collapsed building and injured
  - People count: 2
  - Requested resources: ambulance, medical_team
  - Priority score: 91
  - Severity: critical
  - Status: assigned
  - Assigned resource ID: res-ambulance-1
  - Hop count: 0
- This is existing test data, not a real emergency report. The API result confirms the request and assignment are currently present; it does not by itself prove every persistence scenario.
5. LoRa simulation endpoint
- Called GET http://localhost:4000/simulate_lora?hops=3.
- Result: Passed. The endpoint returned two simulated packets:
  1. A collapsed-building/trapped-people demo packet with hopCount: 3.
  2. A flood/children-stranded demo packet with hopCount: 2.
- The response explicitly states that this endpoint generates representative packets for UI/testing and does not import them into the SOS store.
- The real POST /sync_lora gateway integration has not been verified. It attempts to fetch /get_requests from a gateway IP, defaulting to 192.168.4.1.
Current status
Check	Result
npm run build	Passed
npm test	5 passed, 1 failed
GET /health	Passed
GET /get_requests	Passed; one assigned test SOS returned
GET /simulate_lora?hops=3	Passed; two simulated packets returned
Real LoRa gateway ingestion	Not tested / not verified