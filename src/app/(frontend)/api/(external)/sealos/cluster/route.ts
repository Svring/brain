import { NextRequest, NextResponse } from "next/server";
import { createClusterService } from "@/lib/sealos/resources/cluster/cluster-api/cluster-api-service";
import { clusterCreateFormSchema } from "@/schemas/forms/cluster/cluster-create-form-schema";
import { SealosApiContextSchema } from "@/lib/sealos/sealos-api-context-schema";
import { getRegionUrlFromKubeconfig } from "@/lib/k8s/k8s-api/k8s-api-utils";

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
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating cluster:", error);
    return NextResponse.json(
      { error: "Failed to create cluster" },
      { status: 500 }
    );
  }
}
