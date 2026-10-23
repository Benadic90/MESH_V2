import { createServer } from "node:http";
import { once } from "node:events";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Server } from "socket.io";
import { io as Client } from "socket.io-client";
import { app } from "../src/app";
import { resetStore, createSosRequest, sanitizeSosForSocket } from "../src/store";
import { buildSafeGatewayUrl } from "../src/sync/gateway";
import { importedSosSchema } from "../src/validation";

function getPort(server: ReturnType<typeof createServer>): number {
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Server did not bind to a TCP port");
  }
  return address.port;
}

describe("backend security regressions", () => {
  let server: ReturnType<typeof createServer>;
  let ioServer: Server;

  beforeEach(async () => {
    process.env.ADMIN_API_TOKEN = "test-admin-token";
    resetStore();
    server = createServer(app);
    ioServer = new Server(server, { cors: { origin: "*" } });
    ioServer.use((socket, next) => {
      const rawToken =
        (typeof socket.handshake.auth?.token === "string" && socket.handshake.auth.token) ||
        ((typeof socket.handshake.headers.authorization === "string"
          ? socket.handshake.headers.authorization
          : Array.isArray(socket.handshake.headers.authorization)
            ? socket.handshake.headers.authorization[0]
            : undefined) ?? "");

      const token = rawToken.startsWith("Bearer ") ? rawToken.slice("Bearer ".length).trim() : rawToken.trim();
      if (token !== process.env.ADMIN_API_TOKEN) {
        next(new Error("Invalid authentication token"));
        return;
      }

      next();
    });
    app.locals.io = ioServer;
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
  });

  afterEach(async () => {
    ioServer.close();
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
    delete process.env.ADMIN_API_TOKEN;
    resetStore();
  });

  it("requires admin auth for request retrieval and resource assignment", async () => {
    const port = getPort(server);

    const unauthenticated = await fetch(`http://127.0.0.1:${port}/get_requests`);
    expect(unauthenticated.status).toBe(401);

    const invalid = await fetch(`http://127.0.0.1:${port}/get_requests`, {
      headers: { Authorization: "Bearer wrong-token" },
    });
    expect(invalid.status).toBe(403);

    const created = await fetch(`http://127.0.0.1:${port}/send_sos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reporterName: "Test Reporter",
        contactNumber: "+15555550100",
        location: { area: "Sector 7", lat: 12.5, lng: 77.5 },
        message: "Building collapsed and people are trapped",
        peopleCount: 3,
        neededResources: ["ambulance"],
      }),
    });
    expect(created.status).toBe(201);
    const createdBody = await created.json();

    const valid = await fetch(`http://127.0.0.1:${port}/get_requests`, {
      headers: { Authorization: `Bearer ${process.env.ADMIN_API_TOKEN}` },
    });
    expect(valid.status).toBe(200);
    const validBody = await valid.json();
    expect(validBody.success).toBe(true);
    expect(validBody.data.length).toBeGreaterThan(0);

    const assignment = await fetch(`http://127.0.0.1:${port}/assign_resource`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ADMIN_API_TOKEN}`,
      },
      body: JSON.stringify({ requestId: createdBody.data.id, resourceIds: ["res-ambulance-1"] }),
    });
    expect(assignment.status).toBe(200);
    const assignmentBody = await assignment.json();
    expect(assignmentBody.success).toBe(true);
    expect(assignmentBody.data.request.id).toBe(createdBody.data.id);
  });

  it("rejects unauthenticated Socket.IO clients and only emits sanitized events", async () => {
    const port = getPort(server);

    const badSocket = Client(`http://127.0.0.1:${port}`, {
      transports: ["websocket"],
      auth: { token: "wrong-token" },
    });

    const badError = await Promise.race([
      once(badSocket, "connect_error").then(() => "connect_error"),
      once(badSocket, "connect").then(() => "connected"),
    ]);
    expect(badError).toBe("connect_error");
    expect(badSocket.connected).toBe(false);

    const goodSocket = Client(`http://127.0.0.1:${port}`, {
      transports: ["websocket"],
      auth: { token: `Bearer ${process.env.ADMIN_API_TOKEN}` },
    });

    await once(goodSocket, "connect");
    expect(goodSocket.connected).toBe(true);

    const sos = createSosRequest({
      reporterName: "Need help",
      contactNumber: "1234567890",
      location: { area: "Sector 9", lat: 12.3, lng: 77.2 },
      message: "Fire in building, trapped children inside",
      peopleCount: 4,
      neededResources: ["fire_team"],
    });

    ioServer.emit("sos_created", sanitizeSosForSocket(sos));
    const [event] = await once(goodSocket, "sos_created");
    expect(event).toMatchObject({ area: "Sector 9" });
    expect(event).not.toHaveProperty("message");
    expect(event).not.toHaveProperty("location");
    expect(event).not.toHaveProperty("reporterName");
    expect(event).not.toHaveProperty("contactNumber");

    goodSocket.disconnect();
    badSocket.disconnect();
  });

  it("rejects malicious gateway destinations before network access", async () => {
    await expect(buildSafeGatewayUrl("http://localhost:8080/get_requests", "192.168.4.1", "/get_requests")).rejects.toThrow();
    await expect(buildSafeGatewayUrl("http://127.0.0.1:8080/get_requests", "192.168.4.1", "/get_requests")).rejects.toThrow();
    await expect(buildSafeGatewayUrl("https://example.com/get_requests", "192.168.4.1", "/get_requests")).rejects.toThrow();
    await expect(buildSafeGatewayUrl("http://192.168.4.1/evil", "192.168.4.1", "/get_requests")).rejects.toThrow();

    const url = await buildSafeGatewayUrl("192.168.4.1", "192.168.4.1", "/get_requests");
    expect(url.toString()).toBe("http://192.168.4.1/get_requests");
  });

  it("validates imported payloads and rejects invalid or oversized payloads", () => {
    const valid = importedSosSchema.parse({
      message: "Water rising, people stranded",
      location: { area: "Sector 3", lat: 12.1, lng: 77.4 },
      peopleCount: 2,
      neededResources: ["ambulance"],
      contactNumber: "9000000001",
      hopCount: 2,
    });
    expect(valid.message).toBe("Water rising, people stranded");

    expect(() => importedSosSchema.parse({
      message: "short",
      location: { area: "A" },
    })).toThrow();

    expect(() => importedSosSchema.parse({
      message: "x".repeat(1001),
      location: { area: "B" },
    })).toThrow();

    expect(() => importedSosSchema.parse({
      message: "Need help",
      location: { area: "C", lat: 91 },
    })).toThrow();

    expect(() => importedSosSchema.parse({
      message: "Need help",
      location: { area: "C", nested: { bad: true } },
    })).toThrow();
  });
});
