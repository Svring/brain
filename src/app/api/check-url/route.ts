import { NextRequest, NextResponse } from "next/server";
import isPortReachable from "is-port-reachable";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL required" }, { status: 400 });
  }

  try {
    // Parse the URL to extract host and port
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname;
    const port = parsedUrl.port
      ? parseInt(parsedUrl.port)
      : parsedUrl.protocol === "https:"
      ? 443
      : 80;

    // Check TCP connectivity
    const isReachable = await isPortReachable(port, { host, timeout: 5000 });

    return NextResponse.json({
      ok: isReachable,
      status: isReachable ? 200 : 503,
      statusText: isReachable ? "Reachable" : "Service Unavailable",
    });
  } catch (error) {
    console.error("URL check failed:", error);
    return NextResponse.json({
      ok: false,
      status: 503,
      statusText: "Service Unavailable",
      error: error instanceof Error ? error.message : "Failed to check URL",
    });
  }
}
