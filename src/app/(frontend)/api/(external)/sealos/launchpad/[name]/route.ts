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

    // Create K8s context for getLaunchpad
    const k8sContext = K8sApiContextSchema.parse({
      kubeconfig,
      namespace,
      regionUrl,
    });

    const { name } = await params;

    // Try both deployment and statefulset targets
    const deploymentTarget = BuiltinResourceTargetSchema.parse({
      type: "builtin",
      resourceType: "deployment",
      name,
    });

    const statefulsetTarget = BuiltinResourceTargetSchema.parse({
      type: "builtin",
      resourceType: "statefulset",
      name,
    });

    // Try deployment first, then statefulset if deployment fails
    try {
      const result = await getLaunchpad(k8sContext, deploymentTarget);
      return NextResponse.json(result);
    } catch (deploymentError) {
      try {
        const result = await getLaunchpad(k8sContext, statefulsetTarget);
        return NextResponse.json(result);
      } catch (statefulsetError) {
        // Both failed, throw the first error
        throw deploymentError;
      }
    }
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

    // Create K8s context for getting current launchpad
    const k8sContext = K8sApiContextSchema.parse({
      kubeconfig,
      namespace,
      regionUrl,
    });

    // Create Sealos context for updateLaunchpadService
    const sealosContext = SealosApiContextSchema.parse({
      baseUrl: regionUrl,
      authorization,
    });

    const body = await request.json();
    const { name } = await params;

    // Try both deployment and statefulset targets to get current launchpad
    const deploymentTarget = BuiltinResourceTargetSchema.parse({
      type: "builtin",
      resourceType: "deployment",
      name,
    });

    const statefulsetTarget = BuiltinResourceTargetSchema.parse({
      type: "builtin",
      resourceType: "statefulset",
      name,
    });

    let currentLaunchpad;
    try {
      currentLaunchpad = await getLaunchpad(k8sContext, deploymentTarget);
    } catch (deploymentError) {
      try {
        currentLaunchpad = await getLaunchpad(k8sContext, statefulsetTarget);
      } catch (statefulsetError) {
        throw deploymentError;
      }
    }

    // Start with minimal update data - only include what we're actually updating
    const updateData: any = {
      name: currentLaunchpad.name,
    };

    // Only include resource data if we're updating CPU or memory
    if (body.cpu !== undefined || body.memory !== undefined) {
      updateData.resource = {
        ...(currentLaunchpad.resource || { replicas: 1, cpu: 1, memory: 1 }),
      };

      if (body.cpu !== undefined) {
        updateData.resource.cpu = body.cpu;
      }
      if (body.memory !== undefined) {
        updateData.resource.memory = body.memory;
      }
    }

    // Only include image data if we're updating the image
    if (body.updateImage) {
      updateData.image = { imageName: body.updateImage };
    }

    // Only include port data if we're doing port operations
    const hasPortOperations =
      (body.createPorts && Array.isArray(body.createPorts)) ||
      (body.deletePorts && Array.isArray(body.deletePorts));

    if (hasPortOperations) {
      let updatedPorts = [...(currentLaunchpad.ports || [])];

      // Add new ports from createPorts
      if (body.createPorts && Array.isArray(body.createPorts)) {
        const newPorts = body.createPorts.map((portNumber: number) => ({
          number: portNumber,
          protocol: "HTTP",
          exposesPublicDomain: true,
        }));
        updatedPorts = [...updatedPorts, ...newPorts];
      }

      // Remove ports from deletePorts
      if (body.deletePorts && Array.isArray(body.deletePorts)) {
        updatedPorts = updatedPorts.filter(
          (port) => !body.deletePorts.includes(port.number)
        );
      }

      updateData.ports = updatedPorts;
    }

    // Only include environment data if we're doing env operations
    const hasEnvOperations =
      (body.createEnv && Array.isArray(body.createEnv)) ||
      (body.updateEnv && Array.isArray(body.updateEnv)) ||
      (body.deleteEnv && Array.isArray(body.deleteEnv));

    if (hasEnvOperations) {
      let updatedEnv = [...(currentLaunchpad.env || [])];

      // Add new environment variables from createEnv
      if (body.createEnv && Array.isArray(body.createEnv)) {
        const newEnvVars = body.createEnv.map(
          ([name, value]: [string, string]) => ({
            name,
            value,
          })
        );
        updatedEnv = [...updatedEnv, ...newEnvVars];
      }

      // Update existing environment variables from updateEnv
      if (body.updateEnv && Array.isArray(body.updateEnv)) {
        body.updateEnv.forEach(([name, value]: [string, string]) => {
          const existingIndex = updatedEnv.findIndex(
            (env) => env.name === name
          );
          if (existingIndex !== -1) {
            updatedEnv[existingIndex] = { name, value };
          } else {
            // If not found, add it
            updatedEnv.push({ name, value });
          }
        });
      }

      // Remove environment variables from deleteEnv
      if (body.deleteEnv && Array.isArray(body.deleteEnv)) {
        updatedEnv = updatedEnv.filter(
          (env) => !body.deleteEnv.includes(env.name)
        );
      }

      updateData.env = updatedEnv;
    }

    // Validate the update data
    const validatedUpdateData = launchpadUpdateFormSchema.parse(updateData);

    const result = await updateLaunchpadService(
      sealosContext,
      validatedUpdateData
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating launchpad:", error);
    return NextResponse.json(
      { error: "Failed to update launchpad" },
      { status: 500 }
    );
  }
}
