import { NextRequest, NextResponse } from "next/server";
import {
  getDevbox,
  updateDevbox,
  deleteDevbox,
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

    // Create K8s context for getDevbox
    const k8sContext = K8sApiContextSchema.parse({
      kubeconfig,
      namespace,
      regionUrl,
    });

    const { name } = await params;
    const target = CustomResourceTargetSchema.parse(
      convertResourceTypeToTarget("devbox", name)
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

// DELETE /api/sealos/devbox/[name] - Delete devbox
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

    // Extract region URL from kubeconfig
    const regionUrl = await getRegionUrlFromKubeconfig(kubeconfig);

    // Create Sealos context for deleteDevbox
    const sealosContext = SealosApiContextSchema.parse({
      baseUrl: regionUrl,
      authorization,
    });

    const { name } = await params;

    const result = await deleteDevbox(sealosContext, name);

    // Check if the result indicates an error
    if (result.code && result.code >= 400) {
      return NextResponse.json(result, { status: result.code });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting devbox:", error);
    return NextResponse.json(
      { error: "Failed to delete devbox" },
      { status: 500 }
    );
  }
}

// PATCH /api/sealos/devbox/[name] - Update devbox
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

    // Decode the kubeconfig from authorization header
    const kubeconfig = decodeURIComponent(authorization);

    // Extract namespace and region URL from kubeconfig
    const [namespace, regionUrl] = await Promise.all([
      getCurrentNamespace(kubeconfig),
      getRegionUrlFromKubeconfig(kubeconfig),
    ]);

    // Create K8s context for getting current devbox
    const k8sContext = K8sApiContextSchema.parse({
      kubeconfig,
      namespace,
      regionUrl,
    });

    // Create Sealos context for updateDevbox
    const sealosContext = SealosApiContextSchema.parse({
      baseUrl: regionUrl,
      authorization,
    });

    const body = await request.json();
    const { name } = await params;

    console.log("body", body);

    // Get current devbox to merge with updates
    const target = CustomResourceTargetSchema.parse(
      convertResourceTypeToTarget("devbox", name)
    );
    const currentDevbox = await getDevbox(k8sContext, target);

    // Start with current devbox data
    const updateData: any = {
      name: currentDevbox.name,
    };

    // Only include resource if it was actually provided in the request
    if (body.cpu !== undefined || body.memory !== undefined) {
      updateData.resource = {
        ...currentDevbox.resources,
      };

      // Update CPU and memory if provided
      if (body.cpu !== undefined) {
        updateData.resource.cpu = body.cpu;
      }
      if (body.memory !== undefined) {
        updateData.resource.memory = body.memory;
      }
    }

    // Handle port operations only if specified
    let shouldUpdatePorts = false;

    // Transform current ports from object schema to form schema format
    let updatedPorts = (currentDevbox.ports || []).map((port: any) => ({
      number: port.number,
      portName: port.portName,
    }));

    // If deletePorts are specified, filter out deleted ports from existing ports
    if (body.deletePorts && Array.isArray(body.deletePorts)) {
      updatedPorts = updatedPorts.filter(
        (port) => !body.deletePorts.includes(port.number)
      );
      shouldUpdatePorts = true;
    }

    // If createPorts are specified, add new ports
    if (body.createPorts && Array.isArray(body.createPorts)) {
      const newPorts = body.createPorts.map((portNumber: number) => ({
        number: portNumber,
        protocol: "HTTP",
        exposesPublicDomain: true,
      }));
      updatedPorts = [...updatedPorts, ...newPorts];
      shouldUpdatePorts = true;
    }

    // Update ports if any changes were made
    if (shouldUpdatePorts) {
      updateData.ports = updatedPorts;
    }

    // Validate the update data
    const validatedUpdateData = devboxUpdateFormSchema.parse(updateData);

    console.log("validatedUpdateData", validatedUpdateData);

    const result = await updateDevbox(sealosContext, name, validatedUpdateData);

    // Check if the result indicates an error
    if (result.code && result.code >= 400) {
      return NextResponse.json(result, { status: result.code });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating devbox:", error);
    return NextResponse.json(
      { error: "Failed to update devbox" },
      { status: 500 }
    );
  }
}
