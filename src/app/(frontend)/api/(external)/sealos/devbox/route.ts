import { NextRequest, NextResponse } from "next/server";
import { createDevbox } from "@/lib/sealos/resources/devbox/devbox-api/devbox-api-service";
import { devboxCreateFormSchema } from "@/schemas/forms/devbox/devbox-create-form-schema";
import { SealosApiContextSchema } from "@/lib/sealos/sealos-api-context-schema";
import { getRegionUrlFromKubeconfig } from "@/lib/k8s/k8s-api/k8s-api-utils";

// POST /api/sealos/devbox - Create new devbox
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

    // Decode the kubeconfig from authorization header
    const kubeconfig = decodeURIComponent(authorization);

    // Extract region URL from kubeconfig
    const regionUrl = await getRegionUrlFromKubeconfig(kubeconfig);

    // Create Sealos context for createDevbox
    const sealosContext = SealosApiContextSchema.parse({
      baseUrl: regionUrl,
      authorization,
    });

    const body = await request.json();

    // Extract required and optional data
    const { name, runtime, cpu, memory, ports } = body;

    if (!name || !runtime) {
      return NextResponse.json(
        { error: "Missing required fields: name and runtime" },
        { status: 400 }
      );
    }

    // Construct form data with provided values and defaults
    const devboxData: any = {
      name,
      runtime,
    };

    // Add resource configuration if provided
    if (cpu !== undefined || memory !== undefined) {
      devboxData.resource = {
        ...(cpu !== undefined && { cpu }),
        ...(memory !== undefined && { memory }),
      };
    }

    // Add ports if provided
    if (ports && Array.isArray(ports) && ports.length > 0) {
      devboxData.ports = ports.map((portNumber: number) => ({
        number: portNumber,
        protocol: "HTTP" as const,
        exposesPublicDomain: true,
      }));
    }

    // Validate the create data
    const validatedCreateData = devboxCreateFormSchema.parse(devboxData);

    const result = await createDevbox(sealosContext, validatedCreateData);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating devbox:", error);
    return NextResponse.json(
      { error: "Failed to create devbox" },
      { status: 500 }
    );
  }
}
