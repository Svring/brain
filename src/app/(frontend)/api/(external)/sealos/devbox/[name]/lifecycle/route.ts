import { NextRequest, NextResponse } from "next/server";
import {
  startDevbox,
  pauseDevbox,
  shutdownDevbox,
  restartDevbox,
  deleteDevbox,
} from "@/lib/sealos/resources/devbox/devbox-api/devbox-api-service";
import { SealosApiContextSchema } from "@/lib/sealos/sealos-api-context-schema";
import { getRegionUrlFromKubeconfig } from "@/lib/k8s/k8s-api/k8s-api-utils";
import { z } from "zod";

const LifecycleActionSchema = z.object({
  action: z.enum(["start", "pause", "shutdown", "restart", "delete"]),
});

// POST /api/sealos/devbox/lifecycle - Devbox lifecycle operations
export async function POST(
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

    const body = await request.json();
    const { action } = LifecycleActionSchema.parse(body);

    let result;
    switch (action) {
      case "start":
        result = await startDevbox(context, params.name);
        break;
      case "pause":
        result = await pauseDevbox(context, params.name);
        break;
      case "shutdown":
        result = await shutdownDevbox(context, params.name);
        break;
      case "restart":
        result = await restartDevbox(context, params.name);
        break;
      case "delete":
        result = await deleteDevbox(context, params.name);
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error performing devbox lifecycle action:", error);
    return NextResponse.json(
      { error: "Failed to perform lifecycle action" },
      { status: 500 }
    );
  }
}
