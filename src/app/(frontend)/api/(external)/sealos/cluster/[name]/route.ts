import { NextRequest, NextResponse } from "next/server";
import {
  getCluster,
  updateClusterService,
} from "@/lib/sealos/resources/cluster/cluster-api/cluster-api-service";
import { SealosApiContextSchema } from "@/lib/sealos/sealos-api-context-schema";
import { K8sApiContextSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { clusterUpdateFormSchema } from "@/schemas/forms/cluster/cluster-update-form-schema";
import {
  getCurrentNamespace,
  getRegionUrlFromKubeconfig,
} from "@/lib/k8s/k8s-api/k8s-api-utils";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

// GET /api/sealos/cluster/[name] - Get cluster information
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

    const { name } = await params;
    const target = CustomResourceTargetSchema.parse(
      convertResourceTypeToTarget("cluster", name)
    );

    const result = await getCluster(k8sContext, target);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting cluster:", error);
    return NextResponse.json(
      { error: "Failed to get cluster" },
      { status: 500 }
    );
  }
}

// PATCH /api/sealos/cluster/[name] - Update cluster
export async function PATCH(
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

    // Create Sealos context for updateClusterService
    const sealosContext = SealosApiContextSchema.parse({
      baseUrl: regionUrl,
      authorization,
    });

    const body = await request.json();

    // Transform the data: move cpu and memory into resource field
    const transformedBody = {
      ...body,
      resource: {
        cpu: body.cpu,
        memory: body.memory,
        ...body.resource, // Preserve any existing resource fields
      },
    };

    // Remove cpu and memory from top level since they're now in resource
    delete transformedBody.cpu;
    delete transformedBody.memory;

    delete transformedBody.storage;

    // console.log("transformedBody", transformedBody);

    const updateData = clusterUpdateFormSchema.parse(transformedBody);

    const result = await updateClusterService(updateData, sealosContext);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating cluster:", error);
    return NextResponse.json(
      { error: "Failed to update cluster" },
      { status: 500 }
    );
  }
}
