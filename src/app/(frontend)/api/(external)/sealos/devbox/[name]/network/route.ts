import { NextRequest, NextResponse } from "next/server";
import { checkDevboxReady } from "@/lib/sealos/resources/devbox/devbox-api/devbox-api-service";
import { SealosApiContextSchema } from "@/lib/sealos/sealos-api-context-schema";
import {
  getRegionUrlFromKubeconfig,
  getCurrentNamespace,
} from "@/lib/k8s/k8s-api/k8s-api-utils";
import { getDevboxObject } from "@/lib/sealos/services/bridge/bridge-resources/bridge-sealos/devbox/devbox-bridge-query";
import { extractContainerPorts } from "@/lib/sealos/services/ports/ports-utils";
import { checkPortsReachability } from "@/lib/sealos/services/ports/ports-api";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { K8sApiContextSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";

// GET /api/sealos/devbox/[name]/network - Check devbox network status
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

    // Create K8s context for getDevboxObject
    const k8sContext = K8sApiContextSchema.parse({
      kubeconfig,
      namespace,
      regionUrl,
    });

    // Create Sealos context for checkDevboxReady
    const sealosContext = SealosApiContextSchema.parse({
      baseUrl: regionUrl,
      authorization,
    });

    const { name } = await params;

    // Create target for devbox
    const target = CustomResourceTargetSchema.parse({
      type: "custom",
      resourceType: "devbox",
      group: "devbox.sealos.io",
      version: "v1alpha1",
      plural: "devboxes",
      name,
    });

    // Get devbox object with complete port information
    const devboxObject = await getDevboxObject(k8sContext, target);

    // Extract container ports for network diagnosis
    const containerPortsData = extractContainerPorts(devboxObject?.ports);

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
    const networkStatus = await checkDevboxReady(sealosContext, name);

    // Format data in the structure expected by NetworkChart
    const combinedStatusData =
      devboxObject?.ports?.map((port: any) => {
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
    console.error("Error checking devbox network status:", error);
    return NextResponse.json(
      { error: "Failed to check network status" },
      { status: 500 }
    );
  }
}
