import { NextRequest, NextResponse } from "next/server";
import {
  getDevbox,
  updateDevbox,
} from "@/lib/sealos/resources/devbox/devbox-api/devbox-api-service";
import { devboxUpdateFormSchema } from "@/schemas/forms/devbox/devbox-update-form-schema";
import { SealosApiContextSchema } from "@/lib/sealos/sealos-api-context-schema";
import { K8sApiContextSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
  getCurrentNamespace,
  getRegionUrlFromKubeconfig,
} from "@/lib/k8s/k8s-api/k8s-api-utils";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

// GET /api/sealos/devbox/[name] - Get devbox information
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

    // Create K8s context for getDevbox
    const k8sContext = K8sApiContextSchema.parse({
      kubeconfig,
      namespace,
      regionUrl,
    });

    const target = CustomResourceTargetSchema.parse(
      convertResourceTypeToTarget("devbox", params.name)
    );

    const result = await getDevbox(k8sContext, target);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting devbox:", error);
    return NextResponse.json(
      { error: "Failed to get devbox" },
      { status: 500 }
    );
  }
}

// PATCH /api/sealos/devbox/[name] - Update devbox
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

    // Create Sealos context for updateDevbox
    const sealosContext = SealosApiContextSchema.parse({
      baseUrl: regionUrl,
      authorization,
    });

    const body = await request.json();
    const updateData = devboxUpdateFormSchema.parse(body);

    const result = await updateDevbox(sealosContext, params.name, updateData);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating devbox:", error);
    return NextResponse.json(
      { error: "Failed to update devbox" },
      { status: 500 }
    );
  }
}
