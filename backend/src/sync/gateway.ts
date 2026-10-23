import dns from "node:dns/promises";
import { isIP } from "node:net";

export const MAX_IMPORT_ITEMS = 100;
export const MAX_RESPONSE_BYTES = 1_048_576;

function isAllowedPrivateAddress(address: string): boolean {
  const normalized = address.trim().toLowerCase();

  if (!normalized || normalized === "localhost" || normalized.endsWith(".localhost")) {
    return false;
  }

  if (normalized === "0.0.0.0" || normalized === "::" || normalized === "::1") {
    return false;
  }

  if (normalized.startsWith("127.") || normalized.startsWith("::ffff:127.")) {
    return false;
  }

  if (normalized.startsWith("169.254.") || normalized.startsWith("::ffff:169.254.")) {
    return false;
  }

  if (normalized.startsWith("fe80:") || normalized.startsWith("::ffff:fe80:")) {
    return false;
  }

  if (normalized.startsWith("224.") || normalized.startsWith("ff")) {
    return false;
  }

  if (isIP(normalized) === 4) {
    return (
      /^10\./.test(normalized) ||
      /^192\.168\./.test(normalized) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(normalized) ||
      /^100\.(6[4-9]|[7-9]\d|1[0-1]\d|12[0-7])\./.test(normalized)
    );
  }

  if (isIP(normalized) === 6) {
    return (
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("::ffff:10.") ||
      normalized.startsWith("::ffff:192.168.") ||
      normalized.startsWith("::ffff:172.")
    );
  }

  return false;
}

export async function buildSafeGatewayUrl(
  configValue: string | undefined,
  fallbackHost: string,
  expectedPath: string
): Promise<URL> {
  const rawValue = (configValue ?? fallbackHost).trim();
  if (!rawValue) {
    throw new Error("Gateway host is not configured");
  }

  const candidate = /^https?:\/\//i.test(rawValue) ? rawValue : `http://${rawValue}`;
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error("Gateway host is invalid");
  }

  if (url.protocol !== "http:") {
    throw new Error("Gateway protocol must be http");
  }

  if (url.username || url.password || url.hash || url.search) {
    throw new Error("Gateway url contains forbidden components");
  }

  if (url.pathname === "/" && expectedPath !== "/") {
    url.pathname = expectedPath;
  }

  const requestedPath = url.pathname;
  if (requestedPath !== expectedPath && requestedPath !== `${expectedPath}/`) {
    throw new Error("Gateway path is not allowed");
  }

  const port = Number(url.port || "80");
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Gateway port is invalid");
  }

  if (port !== 80 && port !== 443) {
    throw new Error("Gateway port is not allowed");
  }

  const hostname = url.hostname;
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new Error("Gateway host is not allowed");
  }

  if (isIP(hostname) !== 0) {
    if (!isAllowedPrivateAddress(hostname)) {
      throw new Error("Gateway host is not an approved private network address");
    }
    return url;
  }

  const resolved = await dns.lookup(hostname, { all: true });
  if (resolved.length === 0) {
    throw new Error("Gateway host could not be resolved");
  }

  const allAllowed = resolved.every(({ address }) => isAllowedPrivateAddress(address));
  if (!allAllowed) {
    throw new Error("Gateway host resolves outside the approved private network");
  }

  return url;
}
