import { NextRequest, NextResponse } from "next/server";

// In-memory cache for request deduplication
// In production, consider using Redis or similar for distributed systems
const requestCache = new Map<string, { timestamp: number }>();
const CACHE_TTL = 5000; // 5 seconds TTL for cached responses

// Create a unique hash for the request using Web Crypto API
async function createRequestHash(request: NextRequest): Promise<string> {
  const url = request.url;
  const method = request.method;

  // For POST requests, try to get the body content
  let bodyContent = "";
  if (method === "POST" && request.body) {
    // Clone the request to read the body without consuming it
    const clonedRequest = request.clone();
    // Note: In middleware, we can't easily read the body synchronously
    // So we'll use a combination of URL, method, and headers for now
  }

  const headers = JSON.stringify(Object.fromEntries(request.headers.entries()));

  // Create hash based on method, URL, and headers
  // This will catch most duplicate requests while allowing legitimate ones
  const content = `${method}:${url}:${headers}`;

  // Use Web Crypto API instead of Node.js crypto
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}

// Check if request is a duplicate
function isDuplicateRequest(hash: string): boolean {
  const cached = requestCache.get(hash);
  if (!cached) return false;

  // Check if cache is still valid
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    requestCache.delete(hash);
    return false;
  }

  return true;
}

// Cache the request timestamp
function cacheRequest(hash: string): void {
  requestCache.set(hash, {
    timestamp: Date.now(),
  });

  // Clean up old entries to prevent memory leaks
  if (requestCache.size > 1000) {
    const now = Date.now();
    for (const [key, value] of requestCache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        requestCache.delete(key);
      }
    }
  }
}

export async function middleware(request: NextRequest) {
  // Only apply to /api/copilot routes
  if (!request.nextUrl.pathname.startsWith("/api/copilot")) {
    return NextResponse.next();
  }

  // Create unique hash for this request
  const requestHash = await createRequestHash(request);

  // Check if this is a duplicate request
  if (isDuplicateRequest(requestHash)) {
    console.log(
      `Duplicate request detected for /api/copilot, hash: ${requestHash}`
    );

    // Return a response indicating duplicate request
    return new NextResponse(
      JSON.stringify({
        error: "Duplicate request detected",
        message:
          "This request has already been processed within the last 5 seconds",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 429, // Too Many Requests
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  }

  // Cache this request timestamp to prevent future duplicates
  cacheRequest(requestHash);

  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/copilot/:path*"],
};
