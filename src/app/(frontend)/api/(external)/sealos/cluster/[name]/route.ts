import { NextRequest, NextResponse } from "next/server";
import {
  getCluster,
  updateClusterService,
  deleteClusterService,
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

// DELETE /api/sealos/cluster/[name] - Delete cluster
export async function DELETE(
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

    // Create K8s context for getting cluster target
    const k8sContext = K8sApiContextSchema.parse({
      kubeconfig,
      namespace,
      regionUrl,
    });

    // Create Sealos context for deleteClusterService
    const sealosContext = SealosApiContextSchema.parse({
      baseUrl: regionUrl,
      authorization,
    });

    const { name } = await params;
    const target = CustomResourceTargetSchema.parse(
      convertResourceTypeToTarget("cluster", name)
    );

    const result = await deleteClusterService(target, sealosContext);

    // Check if the result indicates an error
    if (result.code && result.code >= 400) {
      return NextResponse.json(result, { status: result.code });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting cluster:", error);
    return NextResponse.json(
      { error: "Failed to delete cluster" },
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

    // console.log("body", body);

    // Transform the data: move cpu, memory, storage, and replicas into resource field
    const transformedBody = {
      ...body,
      resource: {
        ...(body.resource || {}), // Preserve any existing resource fields
      },
    };

    // Move top-level fields into resource object if they exist
    if (body.cpu !== undefined) {
      transformedBody.resource.cpu = body.cpu;
      delete transformedBody.cpu;
    }
    if (body.memory !== undefined) {
      transformedBody.resource.memory = body.memory;
      delete transformedBody.memory;
    }
    if (body.storage !== undefined) {
      transformedBody.resource.storage = body.storage;
      delete transformedBody.storage;
    }
    if (body.replicas !== undefined) {
      transformedBody.resource.replicas = body.replicas;
      delete transformedBody.replicas;
    }

    // console.log("transformedBody", transformedBody);

    const updateData = clusterUpdateFormSchema.parse(transformedBody);

    const result = await updateClusterService(updateData, sealosContext);

    // Check if the result indicates an error
    if (result.code && result.code >= 400) {
      return NextResponse.json(result, { status: result.code });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating cluster:", error);
    return NextResponse.json(
      { error: "Failed to update cluster" },
      { status: 500 }
    );
  }
}
