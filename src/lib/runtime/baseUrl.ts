import { getRuntimePorts } from "@/lib/runtime/ports";

/**
 * Loopback host used for internal callbacks and local-only services.
 * Keep configurable to support non-standard loopback setups.
 */
export function getLoopbackHost(): string {
  return process.env.OMNIROUTE_LOOPBACK_HOST || process.env.LOOPBACK_HOST || "127.0.0.1";
}

export function getLoopbackBaseUrl(port?: number): string {
  const { dashboardPort } = getRuntimePorts();
  const p = port ?? dashboardPort;
  return `http://${getLoopbackHost()}:${p}`;
}

/**
 * Best-effort origin reconstruction behind reverse proxies.
 */
export function getRequestOrigin(request: Request): string | null {
  const origin = request.headers.get("origin");
  if (origin) return origin;

  const proto = request.headers.get("x-forwarded-proto");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (proto && host) return `${proto}://${host}`;

  return null;
}

/**
 * Public base URL for generating absolute callback URLs.
 * Prefer request-derived origin, then env, then loopback.
 */
export function getPublicBaseUrl(request?: Request, fallbackPort?: number): string {
  return (
    (request ? getRequestOrigin(request) : null) ||
    process.env.BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    getLoopbackBaseUrl(fallbackPort)
  );
}
