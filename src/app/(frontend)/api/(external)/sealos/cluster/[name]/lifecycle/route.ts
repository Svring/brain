import { NextRequest, NextResponse } from "next/server";
import {
  startClusterService,
  pauseClusterService,
  deleteClusterService,
} from "@/lib/sealos/resources/cluster/cluster-api/cluster-api-service";
import { SealosApiContextSchema } from "@/lib/sealos/sealos-api-context-schema";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { getRegionUrlFromKubeconfig } from "@/lib/k8s/k8s-api/k8s-api-utils";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { z } from "zod";

const LifecycleActionSchema = z.object({
  action: z.enum(["start", "pause", "delete"]),
});

// POST /api/sealos/cluster/[name]/lifecycle - Cluster lifecycle operations
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

    // Compose target from params using utility function
    const target = CustomResourceTargetSchema.parse(
      convertResourceTypeToTarget("cluster", params.name)
    );

    let result;
    switch (action) {
      case "start":
        result = await startClusterService(target, context);
        break;
      case "pause":
        result = await pauseClusterService(target, context);
        break;
      case "delete":
        result = await deleteClusterService(target, context);
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error performing cluster lifecycle action:", error);
    return NextResponse.json(
      { error: "Failed to perform lifecycle action" },
      { status: 500 }
    );
  }
}
