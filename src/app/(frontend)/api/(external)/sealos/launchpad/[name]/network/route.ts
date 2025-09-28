import { NextRequest, NextResponse } from "next/server";
import { checkLaunchpadReady } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-api-service";
import { SealosApiContextSchema } from "@/lib/sealos/sealos-api-context-schema";
import {
  getRegionUrlFromKubeconfig,
  getCurrentNamespace,
} from "@/lib/k8s/k8s-api/k8s-api-utils";
import { getDeploymentObject } from "@/lib/sealos/services/bridge/bridge-resources/bridge-sealos/deployment/deployment-bridge-query";
import { getStatefulSetObject } from "@/lib/sealos/services/bridge/bridge-resources/bridge-sealos/statefulset/statefulset-bridge-query";
import { extractContainerPorts } from "@/lib/sealos/services/ports/ports-utils";
import { checkPortsReachability } from "@/lib/sealos/services/ports/ports-api";
import { BuiltinResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { K8sApiContextSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { getLaunchpad } from "@/lib/sealos/resources/launchpad/launchpad-method/launchpad-query";

// GET /api/sealos/launchpad/[name]/network - Check launchpad network status
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

    // Decode the kubeconfig to get region URL and namespace
    const kubeconfig = decodeURIComponent(authorization);
    const regionUrl = await getRegionUrlFromKubeconfig(kubeconfig);
    const namespace = await getCurrentNamespace(kubeconfig);

    if (!regionUrl || !namespace) {
      return NextResponse.json(
        { error: "Failed to extract region URL or namespace from kubeconfig" },
        { status: 400 }
      );
    }

    // Create K8s context for getLaunchpad
    const k8sContext = K8sApiContextSchema.parse({
      kubeconfig,
      namespace,
      regionUrl,
    });

    // Create Sealos context for checkLaunchpadReady
    const sealosContext = SealosApiContextSchema.parse({
      baseUrl: regionUrl,
      authorization,
    });

    const { name } = await params;

    // First, determine if this launchpad is a deployment or statefulset
    // We need to try both to find the correct resource type
    let launchpadObject;
    let resourceType: "deployment" | "statefulset";

    try {
      // Try deployment first
      const deploymentTarget = BuiltinResourceTargetSchema.parse({
        type: "builtin",
        resourceType: "deployment",
        name,
      });
      launchpadObject = await getDeploymentObject(k8sContext, deploymentTarget);
      resourceType = "deployment";
    } catch {
      try {
        // If deployment fails, try statefulset
        const statefulSetTarget = BuiltinResourceTargetSchema.parse({
          type: "builtin",
          resourceType: "statefulset",
          name,
        });
        launchpadObject = await getStatefulSetObject(
          k8sContext,
          statefulSetTarget
        );
        resourceType = "statefulset";
      } catch {
        return NextResponse.json(
          { error: "Launchpad not found as deployment or statefulset" },
          { status: 404 }
        );
      }
    }

    // Extract container ports for network diagnosis
    const containerPortsData = extractContainerPorts(launchpadObject?.ports);

    // Check container port reachability
    const containerStatus =
      containerPortsData.host && containerPortsData.ports.length > 0
        ? await checkPortsReachability(
            containerPortsData.ports,
            containerPortsData.host,
            2000
          )
        : [];

    // Get network status (public access)
    const networkStatus = await checkLaunchpadReady({ name }, sealosContext);

    // Format data in the structure expected by NetworkChart
    const combinedStatusData =
      launchpadObject?.ports?.map((port: any) => {
        // Get container status for this port
        const containerPortStatus = containerStatus?.find(
          (status: any) => status.port === port.number
        );
        const containerAccess = containerPortStatus?.reachable ?? false;

        // Get network status for this port
        const networkPortStatus = Array.isArray(networkStatus)
          ? networkStatus.find(
              (status: any) =>
                status.url === port.publicAddress ||
                status.url === port.privateAddress
            )
          : undefined;
        const publicAccessStatus = networkPortStatus?.ready ?? false;

        return {
          number: port.number,
          containerAccess,
          publicAccessStatus,
          publicAddress: port.publicAddress || "N/A",
          privateAddress: port.privateAddress || "N/A",
        };
      }) || [];

    // Return comprehensive network analysis data
    const networkAnalysisData = {
      combinedStatusData,
      containerStatus,
      networkStatus,
    };

    return NextResponse.json(networkAnalysisData);
  } catch (error) {
    console.error("Error checking launchpad network status:", error);
    return NextResponse.json(
      { error: "Failed to check network status" },
      { status: 500 }
    );
  }
}
