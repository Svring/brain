import { NextRequest, NextResponse } from "next/server";
import { getDevboxCombinedMonitor } from "@/lib/sealos/resources/devbox/devbox-api/devbox-api-service";
import { SealosApiContextSchema } from "@/lib/sealos/sealos-api-context-schema";
import { getRegionUrlFromKubeconfig } from "@/lib/k8s/k8s-api/k8s-api-utils";
import { z } from "zod";

const MonitorQuerySchema = z.object({
  step: z.string().optional().default("2m"),
});

// GET /api/sealos/devbox/[name]/monitor - Get devbox monitoring data
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

    const { searchParams } = new URL(request.url);
    const query = MonitorQuerySchema.parse({
      step: searchParams.get("step") || "2m",
    });

    const result = await getDevboxCombinedMonitor(
      context,
      params.name,
      query.step
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting devbox monitor data:", error);
    return NextResponse.json(
      { error: "Failed to get monitor data" },
      { status: 500 }
    );
  }
}
