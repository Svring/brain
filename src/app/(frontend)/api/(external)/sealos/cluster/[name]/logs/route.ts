import { NextRequest, NextResponse } from "next/server";
import { getClusterLogs } from "@/lib/sealos/resources/cluster/cluster-api/cluster-api-service";
import { SealosApiContextSchema } from "@/lib/sealos/sealos-api-context-schema";
import { K8sApiContextSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
  getCurrentNamespace,
  getRegionUrlFromKubeconfig,
} from "@/lib/k8s/k8s-api/k8s-api-utils";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

// GET /api/sealos/cluster/[name]/logs - Get cluster logs
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

    // Decode the kubeconfig from authorization header
    const kubeconfig = decodeURIComponent(authorization);

    // Extract namespace and region URL from kubeconfig
    const [namespace, regionUrl] = await Promise.all([
      getCurrentNamespace(kubeconfig),
      getRegionUrlFromKubeconfig(kubeconfig),
    ]);

    // Create K8s context
    const k8sContext = K8sApiContextSchema.parse({
      kubeconfig,
      namespace,
      regionUrl,
    });

    // Create Sealos context
    const sealosContext = SealosApiContextSchema.parse({
      baseUrl: regionUrl,
      authorization,
    });

    const target = CustomResourceTargetSchema.parse(
      convertResourceTypeToTarget("cluster", params.name)
    );

    const result = await getClusterLogs(k8sContext, sealosContext, target);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting cluster logs:", error);
    return NextResponse.json(
      { error: "Failed to get cluster logs" },
      { status: 500 }
    );
  }
}
