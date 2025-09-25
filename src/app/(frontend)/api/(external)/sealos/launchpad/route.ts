import { NextRequest, NextResponse } from "next/server";
import { createLaunchpadService } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-api-service";
import { launchpadCreateFormSchema } from "@/schemas/forms/launchpad/launchpad-create-form-schema";
import { SealosApiContextSchema } from "@/lib/sealos/sealos-api-context-schema";
import { getRegionUrlFromKubeconfig } from "@/lib/k8s/k8s-api/k8s-api-utils";

// POST /api/sealos/launchpad - Create new launchpad
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

    // Create Sealos context for createLaunchpadService
    const sealosContext = SealosApiContextSchema.parse({
      baseUrl: regionUrl,
      authorization,
    });

    const body = await request.json();

    // Extract required and optional data
    const { name, image, cpu, memory, replicas, ports, env } = body;

    if (!name || !image) {
      return NextResponse.json(
        { error: "Missing required fields: name and image" },
        { status: 400 }
      );
    }

    // Construct form data with provided values and defaults
    const launchpadData: any = {
      name,
      image: {
        imageName: image,
      },
    };

    // Add resource configuration if provided
    if (cpu !== undefined || memory !== undefined || replicas !== undefined) {
      launchpadData.resource = {
        ...(replicas !== undefined && { replicas }),
        ...(cpu !== undefined && { cpu }),
        ...(memory !== undefined && { memory }),
      };
    }

    // Add ports if provided
    if (ports && Array.isArray(ports) && ports.length > 0) {
      launchpadData.ports = ports.map((portNumber: number) => ({
        number: portNumber,
        protocol: "HTTP" as const,
        exposesPublicDomain: true,
      }));
    }

    // Add environment variables if provided
    if (env && Array.isArray(env) && env.length > 0) {
      launchpadData.env = env.map(([name, value]: [string, string]) => ({
        name,
        value,
      }));
    }

    // Validate the create data
    const validatedCreateData = launchpadCreateFormSchema.parse(launchpadData);

    const result = await createLaunchpadService(
      sealosContext,
      validatedCreateData
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating launchpad:", error);
    return NextResponse.json(
      { error: "Failed to create launchpad" },
      { status: 500 }
    );
  }
}
