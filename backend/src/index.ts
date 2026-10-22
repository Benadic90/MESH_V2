// ─────────────────────────────────────────────
// RESCUE-MESH V2 — Server entry (Track 2)
// Ports: Express :4000, Yjs WS :1234 room=rescue-mesh-room
// ─────────────────────────────────────────────
import dotenv from "dotenv";
import { createServer } from "node:http";
import fs from "node:fs";
import path from "node:path";
import { Server } from "socket.io";
import { WebSocketServer } from "ws";
// @ts-ignore — y-websocket utils are JS-only
import { setupWSConnection } from "y-websocket/bin/utils";
import { app } from "./app";
import { restoreRequests, restoreResources, snapshotRequests, snapshotResources } from "./store";

dotenv.config();

// Start the collaboration WebSocket; port and room can be overridden via environment.
const yjsPort = Number(process.env.YJS_PORT ?? 1234);
const yjsRoom = process.env.YJS_ROOM ?? "rescue-mesh-room";
const wss = new WebSocketServer({ port: yjsPort });

wss.on("connection", (socket, request) => {
  const requestUrl = request.url ?? "/";
  const requestedRoom = requestUrl.slice(1).split("?")[0];

  if (requestedRoom !== yjsRoom) {
    socket.close(1008, "Room not allowed");
    return;
  }

  setupWSConnection(socket, request);
});

console.log(`[Yjs] WebSocket listening on :${yjsPort}  room="${yjsRoom}"`);

// Restore the in-memory store at boot and persist it periodically and on shutdown.
const snapshotPath = path.join(__dirname, "..", "data", "snapshot.json");
function loadSnapshot(): void {
  try {
    if (fs.existsSync(snapshotPath)) {
      const raw = JSON.parse(fs.readFileSync(snapshotPath, "utf-8"));
      if (Array.isArray(raw.requests)) restoreRequests(raw.requests);
      if (Array.isArray(raw.resources)) restoreResources(raw.resources);
      console.log(`[snapshot] Restored ${raw.requests?.length ?? 0} requests from disk`);
    }
  } catch (e) { console.warn("[snapshot] Load failed:", (e as Error).message); }
}

function saveSnapshot(): void {
  try {
    fs.mkdirSync(path.dirname(snapshotPath), { recursive: true });
    fs.writeFileSync(snapshotPath, JSON.stringify({ requests: snapshotRequests(), resources: snapshotResources(), savedAt: new Date().toISOString() }, null, 2));
  } catch (e) { console.warn("[snapshot] Save failed:", (e as Error).message); }
}
loadSnapshot();
setInterval(saveSnapshot, 30_000);
process.on("SIGINT", () => { saveSnapshot(); process.exit(0); });
process.on("SIGTERM", () => { saveSnapshot(); process.exit(0); });

// Attach Socket.IO to the HTTP server so API handlers can broadcast state changes.
const port = Number(process.env.PORT ?? 4000);
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });
app.locals.io = io;

// Mount hardware routes after Socket.IO is available to their handlers.
import { createSyncEsp32Router } from "./sync/esp32";
import { createSyncLoraRouter } from "./sync/lora";
app.use(createSyncEsp32Router());
app.use(createSyncLoraRouter());

io.on("connection", (socket) => {
  console.log("[socket] connected", socket.id);
  socket.on("disconnect", () => console.log("[socket] disconnected", socket.id));
});

server.listen(port, () => {
  console.log(`[backend] Listening on :${port}  (health: http://localhost:${port}/health)`);
});
