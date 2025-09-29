import { NextRequest, NextResponse } from "next/server";

// GET /api/ai-proxy - Get usage information from AI proxy
export async function GET(request: NextRequest) {
  try {
    // Get the AI proxy URL from environment variables
    const aiProxyUrl = process.env.AI_PROXY_FREE_URL;

    if (!aiProxyUrl) {
      return NextResponse.json(
        { error: "AI_PROXY_FREE_URL environment variable is not configured" },
        { status: 500 }
      );
    }

    // Construct the usage endpoint URL
    const usageUrl = `${aiProxyUrl}/usage`;

    // Forward any authorization headers from the original request
    const authorization = request.headers.get("authorization");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (authorization) {
      headers.Authorization = authorization;
    }

    // Make the request to the AI proxy usage endpoint
    const response = await fetch(usageUrl, {
      method: "GET",
      headers,
    });

    // Check if the response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `AI proxy usage request failed: ${response.status} ${response.statusText}`,
        errorText
      );

      return NextResponse.json(
        {
          error: "Failed to fetch usage data from AI proxy",
          details: errorText,
          status: response.status,
        },
        { status: response.status }
      );
    }

    // Parse the response
    const data = await response.json();

    console.log("AI proxy usage data:", data);

    // Return the usage data in the specified format
    return NextResponse.json({
      data: {
        total_limit: data.total_limit,
        used_today: data.used_today,
        remaining_today: data.remaining_today,
        next_reset_time: data.next_reset_time,
      },
    });
  } catch (error) {
    console.error("Error fetching AI proxy usage:", error);

    // Handle different types of errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        { error: "Network error: Unable to connect to AI proxy service" },
        { status: 503 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid response format from AI proxy service" },
        { status: 502 }
      );
    }

    // Generic error fallback
    return NextResponse.json(
      { error: "Internal server error while fetching usage data" },
      { status: 500 }
    );
  }
}
