import { NextRequest, NextResponse } from "next/server";
import { checkDevboxReady } from "@/lib/sealos/resources/devbox/devbox-api/devbox-api-service";
import { SealosApiContextSchema } from "@/lib/sealos/sealos-api-context-schema";
import { getRegionUrlFromKubeconfig } from "@/lib/k8s/k8s-api/k8s-api-utils";

// GET /api/sealos/devbox/[name]/network - Check devbox network status
export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
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

    const result = await checkDevboxReady(context, params.name);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error checking devbox network status:", error);
    return NextResponse.json(
      { error: "Failed to check network status" },
      { status: 500 }
    );
  }
}
