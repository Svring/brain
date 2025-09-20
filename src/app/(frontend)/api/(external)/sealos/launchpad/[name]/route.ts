import { NextRequest, NextResponse } from "next/server";
import {
  getLaunchpad,
  updateLaunchpadService,
} from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-api-service";
import { SealosApiContextSchema } from "@/lib/sealos/sealos-api-context-schema";
import { K8sApiContextSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { BuiltinResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { launchpadUpdateFormSchema } from "@/schemas/forms/launchpad/launchpad-update-form-schema";
import {
  getCurrentNamespace,
  getRegionUrlFromKubeconfig,
} from "@/lib/k8s/k8s-api/k8s-api-utils";

// GET /api/sealos/launchpad/[name] - Get launchpad information
export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
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

    // Create K8s context for getLaunchpad
    const k8sContext = K8sApiContextSchema.parse({
      kubeconfig,
      namespace,
      regionUrl,
    });

    const target = BuiltinResourceTargetSchema.parse({
      type: "builtin",
      resourceType: "launchpad",
      name: params.name,
    });

    const result = await getLaunchpad(k8sContext, target);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting launchpad:", error);
    return NextResponse.json(
      { error: "Failed to get launchpad" },
      { status: 500 }
    );
  }
}

// PATCH /api/sealos/launchpad/[name] - Update launchpad
export async function PATCH(
  request: NextRequest,
  { params }: { params: { name: string } }
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

    // Create Sealos context for updateLaunchpadService
    const sealosContext = SealosApiContextSchema.parse({
      baseUrl: regionUrl,
      authorization,
    });

    const body = await request.json();
    const updateData = launchpadUpdateFormSchema.parse(body);

    const result = await updateLaunchpadService(sealosContext, updateData);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating launchpad:", error);
    return NextResponse.json(
      { error: "Failed to update launchpad" },
      { status: 500 }
    );
  }
}
