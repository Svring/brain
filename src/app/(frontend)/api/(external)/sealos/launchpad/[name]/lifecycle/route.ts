import { NextRequest, NextResponse } from "next/server";
import {
  startLaunchpadService,
  pauseLaunchpadService,
  restartLaunchpadService,
  deleteLaunchpadService,
} from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-api-service";
import { SealosApiContextSchema } from "@/lib/sealos/sealos-api-context-schema";
import { getRegionUrlFromKubeconfig } from "@/lib/k8s/k8s-api/k8s-api-utils";
import { z } from "zod";

const LifecycleActionSchema = z.object({
  action: z.enum(["start", "pause", "restart", "delete"]),
});

// POST /api/sealos/launchpad/lifecycle - Launchpad lifecycle operations
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

    const body = await request.json();
    const { action } = LifecycleActionSchema.parse(body);
    const { name } = await params;

    let result;
    switch (action) {
      case "start":
        result = await startLaunchpadService({ name }, context);
        break;
      case "pause":
        result = await pauseLaunchpadService({ name }, context);
        break;
      case "restart":
        result = await restartLaunchpadService({ name }, context);
        break;
      case "delete":
        result = await deleteLaunchpadService({ name }, context);
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error performing launchpad lifecycle action:", error);
    return NextResponse.json(
      { error: "Failed to perform lifecycle action" },
      { status: 500 }
    );
  }
}
