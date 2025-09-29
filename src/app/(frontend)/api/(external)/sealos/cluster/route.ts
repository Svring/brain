import { NextRequest, NextResponse } from "next/server";
import { createClusterService } from "@/lib/sealos/resources/cluster/cluster-api/cluster-api-service";
import { clusterCreateFormSchema } from "@/schemas/forms/cluster/cluster-create-form-schema";
import { SealosApiContextSchema } from "@/lib/sealos/sealos-api-context-schema";
import { getRegionUrlFromKubeconfig } from "@/lib/k8s/k8s-api/k8s-api-utils";
import { CLUSTER_CONSTANT_TYPE_VERSION } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-versions";

// Helper function to get the default version for a cluster type
const getDefaultClusterVersion = (type: string): string => {
  const versions =
    CLUSTER_CONSTANT_TYPE_VERSION[
      type as keyof typeof CLUSTER_CONSTANT_TYPE_VERSION
    ];
  return versions?.[0] || "postgresql-14.8.0"; // fallback to postgresql default
};

// POST /api/sealos/cluster - Create new cluster
export async function POST(request: NextRequest) {
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

    // Create Sealos context for createClusterService
    const sealosContext = SealosApiContextSchema.parse({
      baseUrl: regionUrl,
      authorization,
    });

    const body = await request.json();

    // Extract required and optional data
    const { name, type, cpu, memory, storage, replicas } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Missing required fields: name and type" },
        { status: 400 }
      );
    }

    // Construct form data with provided values and defaults
    const clusterData: any = {
      name,
      type,
      version: getDefaultClusterVersion(type),
    };

    // Add resource configuration if provided
    if (
      cpu !== undefined ||
      memory !== undefined ||
      storage !== undefined ||
      replicas !== undefined
    ) {
      clusterData.resource = {
        ...(replicas !== undefined && { replicas }),
        ...(cpu !== undefined && { cpu }),
        ...(memory !== undefined && { memory }),
        ...(storage !== undefined && { storage }),
      };
    }

    // Validate the create data
    const validatedCreateData = clusterCreateFormSchema.parse(clusterData);

    const result = await createClusterService(
      validatedCreateData,
      sealosContext
    );

    // Check if the result indicates an error
    if (result.code && result.code >= 400) {
      return NextResponse.json(result, { status: result.code });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating cluster:", error);
    return NextResponse.json(
      { error: "Failed to create cluster" },
      { status: 500 }
    );
  }
}
