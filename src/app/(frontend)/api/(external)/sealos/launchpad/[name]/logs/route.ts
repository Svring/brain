import { NextRequest, NextResponse } from "next/server";
import { getLaunchpadLogs } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-api-service";
import { SealosApiContextSchema } from "@/lib/sealos/sealos-api-context-schema";
import { K8sApiContextSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { BuiltinResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
  getCurrentNamespace,
  getRegionUrlFromKubeconfig,
} from "@/lib/k8s/k8s-api/k8s-api-utils";

// GET /api/sealos/launchpad/[name]/logs - Get launchpad logs
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

    const { name } = await params;

    // Try both deployment and statefulset targets
    const deploymentTarget = BuiltinResourceTargetSchema.parse({
      type: "builtin",
      resourceType: "deployment",
      name,
    });

    const statefulsetTarget = BuiltinResourceTargetSchema.parse({
      type: "builtin",
      resourceType: "statefulset",
      name,
    });

    // Try deployment first, then statefulset if deployment fails
    try {
      const result = await getLaunchpadLogs(
        k8sContext,
        sealosContext,
        deploymentTarget
      );
      return NextResponse.json(result);
    } catch (deploymentError) {
      try {
        const result = await getLaunchpadLogs(
          k8sContext,
          sealosContext,
          statefulsetTarget
        );
        return NextResponse.json(result);
      } catch (statefulsetError) {
        // Both failed, throw the first error
        throw deploymentError;
      }
    }
  } catch (error) {
    console.error("Error getting launchpad logs:", error);
    return NextResponse.json(
      { error: "Failed to get launchpad logs" },
      { status: 500 }
    );
  }
}
