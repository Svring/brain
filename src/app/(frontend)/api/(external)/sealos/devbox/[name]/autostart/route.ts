import { NextRequest, NextResponse } from "next/server";
import { autostartDevbox } from "@/lib/sealos/resources/devbox/devbox-api/devbox-api-service";
import { SealosApiContextSchema } from "@/lib/sealos/sealos-api-context-schema";
import { getRegionUrlFromKubeconfig } from "@/lib/k8s/k8s-api/k8s-api-utils";

// POST /api/sealos/devbox/[name]/autostart - Enable devbox autostart
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    // Extract authorization from headers
    const authorization = request.headers.get("authorization");

    if (!authorization) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 400 }
      );
    }

    // Decode the kubeconfig to get region URL
    const kubeconfig = decodeURIComponent(authorization);
    const regionUrl = await getRegionUrlFromKubeconfig(kubeconfig);

    // Create Sealos context
    const context = SealosApiContextSchema.parse({
      baseUrl: regionUrl,
      authorization,
    });

    const { name } = await params;

    // Enable autostart for the devbox
    const result = await autostartDevbox(context, name);

    console.log("result", result);

    // Check if the result indicates an error
    if (result.code && result.code >= 400) {
      return NextResponse.json(result, { status: result.code });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error enabling devbox autostart:", error);
    return NextResponse.json(
      { error: "Failed to enable devbox autostart" },
      { status: 500 }
    );
  }
}
