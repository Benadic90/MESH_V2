// Middleware for admin authentication

import { timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export function extractBearerToken(headerValue: string | undefined): string | undefined {
  if (!headerValue) return undefined;
  const match = /^Bearer\s+(\S+)$/i.exec(headerValue.trim());
  return match ? match[1] : undefined;
}

export function isValidAdminToken(candidate: string | undefined): boolean {
  const expectedToken = process.env.ADMIN_API_TOKEN?.trim();

  if (!expectedToken) {
    return false;
  }

  const provided = Buffer.from(candidate ?? "", "utf8");
  const expected = Buffer.from(expectedToken, "utf8");

  if (provided.length !== expected.length) {
    return false;
  }

  try {
    return timingSafeEqual(provided, expected);
  } catch {
    return false;
  }
}

export function requireAdminAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const expectedToken = process.env.ADMIN_API_TOKEN?.trim();

  if (!expectedToken || expectedToken.length === 0) {
    res.status(503).json({
      success: false,
      error: "Administrative authentication is not configured",
    });
    return;
  }

  const authorization = req.get("authorization") ?? "";
  const token = extractBearerToken(authorization);

  if (!token) {
    res.status(401).json({
      success: false,
      error: "Authentication required",
    });
    return;
  }

  if (!isValidAdminToken(token)) {
    res.status(403).json({
      success: false,
      error: "Invalid authentication token",
    });
    return;
  }

  next();
}
