import { NextRequest, NextResponse } from "next/server";
import {
  getCombinedMonitor,
  getCluster,
} from "@/lib/sealos/resources/cluster/cluster-api/cluster-api-service";
import { SealosApiContextSchema } from "@/lib/sealos/sealos-api-context-schema";
import { K8sApiContextSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
  getCurrentNamespace,
  getRegionUrlFromKubeconfig,
} from "@/lib/k8s/k8s-api/k8s-api-utils";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

// GET /api/sealos/cluster/[name]/monitor - Get cluster monitoring data
export async function GET(
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

    // Decode the kubeconfig from authorization header
    const kubeconfig = decodeURIComponent(authorization);

    // Extract namespace and region URL from kubeconfig
    const [namespace, regionUrl] = await Promise.all([
      getCurrentNamespace(kubeconfig),
      getRegionUrlFromKubeconfig(kubeconfig),
    ]);

    // Create K8s context for getCluster
    const k8sContext = K8sApiContextSchema.parse({
      kubeconfig,
      namespace,
      regionUrl,
    });

    // Create Sealos context
    const context = SealosApiContextSchema.parse({
      baseUrl: regionUrl,
      authorization,
    });

    const { name } = await params;

    // Get cluster object to extract dbType
    const target = CustomResourceTargetSchema.parse(
      convertResourceTypeToTarget("cluster", name)
    );
    const cluster = await getCluster(k8sContext, target);

    // Extract dbType from cluster object
    const dbType = cluster?.type;

    if (!dbType) {
      return NextResponse.json(
        { error: "Could not determine database type from cluster" },
        { status: 400 }
      );
    }

    const result = await getCombinedMonitor(context, name, dbType);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting cluster monitor data:", error);
    return NextResponse.json(
      { error: "Failed to get monitor data" },
      { status: 500 }
    );
  }
}
