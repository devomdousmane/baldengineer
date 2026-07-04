import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// ── Security headers ─────────────────────────────────────────
const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options":           "DENY",
  "X-Content-Type-Options":    "nosniff",
  "X-XSS-Protection":          "1; mode=block",
  "Referrer-Policy":           "strict-origin-when-cross-origin",
  "Permissions-Policy":        "camera=(), microphone=(), geolocation=(), payment=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
};

// ── Rate limiting (token bucket per IP+route, in-memory) ─────
interface RateEntry { count: number; resetAt: number }
const rateLimitStore = new Map<string, RateEntry>();
let lastCleanup = Date.now();

const RATE_LIMITS: [string, number][] = [
  ["/api/ai/chat",    10],
  ["/api/factures/",  5],
  ["/api/dashboard",  30],
];
const DEFAULT_RATE_LIMIT = 60;
const WINDOW_MS = 60_000;

function getLimit(pathname: string): number {
  for (const [prefix, limit] of RATE_LIMITS) {
    if (pathname.startsWith(prefix)) return limit;
  }
  return DEFAULT_RATE_LIMIT;
}

function checkRateLimit(ip: string, pathname: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();

  // Periodic cleanup — every 5 min, remove expired entries
  if (now - lastCleanup > 300_000) {
    for (const [k, v] of rateLimitStore) {
      if (now > v.resetAt) rateLimitStore.delete(k);
    }
    lastCleanup = now;
  }

  const key = `${ip}:${pathname.split("/").slice(0, 4).join("/")}`;
  const limit = getLimit(pathname);
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, retryAfter: 0 };
  }
  if (entry.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count++;
  return { ok: true, retryAfter: 0 };
}

// ── Bot detection ─────────────────────────────────────────────
const BOT_SIGNATURES = [
  "python-requests", "go-http-client", "masscan",
  "zgrab", "nuclei", "nmap", "sqlmap", "scrapy",
];

function isSuspiciousBot(ua: string | null): boolean {
  if (!ua) return false;
  const low = ua.toLowerCase();
  return BOT_SIGNATURES.some((sig) => low.includes(sig));
}

// ── CORS ──────────────────────────────────────────────────────
const ALLOWED_METHODS = ["GET", "POST", "OPTIONS"];

function handleCors(req: NextRequest, res: NextResponse): NextResponse | null {
  const origin = req.headers.get("origin");
  if (!origin) return null; // direct nav / no CORS needed

  const allowed = process.env.NEXT_PUBLIC_APP_URL;
  if (!allowed || origin !== allowed) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  res.headers.set("Access-Control-Allow-Origin", allowed);
  res.headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS.join(", "));
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.headers.set("Vary", "Origin");

  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin":  allowed,
        "Access-Control-Allow-Methods": ALLOWED_METHODS.join(", "),
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Vary": "Origin",
      },
    });
  }
  return null;
}

function applySecurityHeaders(res: NextResponse): void {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(k, v);
  }
}

// ── Middleware entry ──────────────────────────────────────────
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const isLocal =
    ip === "127.0.0.1" || ip === "::1" || ip === "unknown" ||
    request.nextUrl.hostname === "localhost";
  const isApi = pathname.startsWith("/api/");

  // 1. HTTP method guard
  if (!ALLOWED_METHODS.includes(request.method)) {
    return new NextResponse("Method Not Allowed", {
      status: 405,
      headers: { Allow: ALLOWED_METHODS.join(", ") },
    });
  }

  // 2. Bot detection — skip for local dev
  if (isApi && !isLocal && isSuspiciousBot(request.headers.get("user-agent"))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 3. Rate limiting — skip for local dev
  if (isApi && !isLocal) {
    const { ok, retryAfter } = checkRateLimit(ip, pathname);
    if (!ok) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After":      String(retryAfter),
          "X-RateLimit-Limit": String(getLimit(pathname)),
        },
      });
    }
  }

  // 4. Supabase session update + auth routing
  const response = await updateSession(request);

  // 5. Security headers on every response
  applySecurityHeaders(response);

  // 6. CORS for API routes
  if (isApi) {
    const corsResult = handleCors(request, response);
    if (corsResult) {
      applySecurityHeaders(corsResult);
      return corsResult;
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
