import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL required" }, { status: 400 });
  }

  try {
    // Use GET method directly
    const response = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });

    // console.log("URL check response data:", response);

    // Check for CORS-related headers that might prevent iframe embedding
    const corsOpenerPolicy = response.headers.get("cross-origin-opener-policy");
    const corsResourcePolicy = response.headers.get(
      "cross-origin-resource-policy"
    );
    const xFrameOptions = response.headers.get("x-frame-options");

    // Determine if CORS policies are restrictive
    const isCorsRestricted =
      (corsOpenerPolicy && corsOpenerPolicy !== "unsafe-none") ||
      (corsResourcePolicy && corsResourcePolicy !== "cross-origin") ||
      (xFrameOptions &&
        (xFrameOptions.toLowerCase() === "deny" ||
          xFrameOptions.toLowerCase() === "sameorigin"));

    return NextResponse.json({
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      corsRestricted: isCorsRestricted,
      corsHeaders: {
        openerPolicy: corsOpenerPolicy,
        resourcePolicy: corsResourcePolicy,
        frameOptions: xFrameOptions,
      },
    });
  } catch (error) {
    console.error("URL check failed:", error);
    return NextResponse.json({
      ok: false,
      corsRestricted: false,
      error: error instanceof Error ? error.message : "Failed to check URL",
    });
  }
}
