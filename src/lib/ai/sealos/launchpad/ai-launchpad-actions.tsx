"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import {
  useCreateLaunchpadMutation,
  useDeleteLaunchpadMutation,
  usePauseLaunchpadMutation,
  useStartLaunchpadMutation,
  useCheckReadyLaunchpadMutation,
} from "@/lib/sealos/launchpad/launchpad-method/launchpad-mutation";
import {
  listLaunchpadOptions,
  getLaunchpadOptions,
  getLaunchpadLogsOptions,
} from "@/lib/sealos/launchpad/launchpad-method/launchpad-query";
import { useQueryClient } from "@tanstack/react-query";
import { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { BuiltinResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

export function activateLaunchpadActions(
  sealosContext: SealosApiContext,
  k8sContext: K8sApiContext
) {
  createLaunchpadAction(sealosContext);
  deleteLaunchpadAction(sealosContext);
  startLaunchpadAction(sealosContext);
  pauseLaunchpadAction(sealosContext);
  checkReadyLaunchpadAction(sealosContext);
  listLaunchpadAction(k8sContext);
  getLaunchpadAction(k8sContext);
  getLaunchpadLogsAction(k8sContext, sealosContext);
}

function createLaunchpadAction(context: SealosApiContext) {
  const createLaunchpad = useCreateLaunchpadMutation(context);

  useCopilotAction({
    name: "createLaunchpad",
    description: "Create a new launchpad",
    parameters: [
      {
        name: "name",
        type: "string",
        description: "Name of the launchpad to create",
        required: true,
      },
      {
        name: "image",
        type: "string",
        description: "Docker image name for the launchpad",
        required: true,
      },
      {
        name: "cpu",
        type: "number",
        description: "CPU allocation in millicores (e.g., 1000 for 1 CPU)",
        required: false,
      },
      {
        name: "memory",
        type: "number",
        description: "Memory allocation in MB",
        required: false,
      },
      {
        name: "replicas",
        type: "number",
        description: "Number of replicas",
        required: false,
      },
    ],
    handler: async ({ name, image, cpu, memory, replicas }) => {
      const createRequest = {
        name,
        image,
        env: {},
        ports: [],
        cpu: cpu || 1000,
        memory: memory || 1024,
        replicas: replicas || 1,
      };

      await createLaunchpad.mutateAsync(createRequest);
      return `Launchpad '${name}' created successfully with image '${image}'.`;
    },
  });
}

function deleteLaunchpadAction(context: SealosApiContext) {
  const deleteLaunchpad = useDeleteLaunchpadMutation(context);

  useCopilotAction({
    name: "deleteLaunchpad",
    description: "Delete a launchpad",
    parameters: [
      {
        name: "name",
        type: "string",
        description: "Name of the launchpad to delete",
        required: true,
      },
    ],
    handler: async ({ name }) => {
      const deleteRequest = {
        name,
      };

      await deleteLaunchpad.mutateAsync(deleteRequest);
      return `Launchpad '${name}' deleted successfully.`;
    },
  });
}

function startLaunchpadAction(context: SealosApiContext) {
  const startLaunchpad = useStartLaunchpadMutation(context);

  useCopilotAction({
    name: "startLaunchpad",
    description: "Start a launchpad",
    parameters: [
      {
        name: "name",
        type: "string",
        description: "Name of the launchpad to start",
        required: true,
      },
    ],
    handler: async ({ name }) => {
      const startRequest = {
        name,
      };

      await startLaunchpad.mutateAsync(startRequest);
      return `Launchpad '${name}' started successfully.`;
    },
  });
}

function pauseLaunchpadAction(context: SealosApiContext) {
  const pauseLaunchpad = usePauseLaunchpadMutation(context);

  useCopilotAction({
    name: "pauseLaunchpad",
    description: "Pause a launchpad",
    parameters: [
      {
        name: "name",
        type: "string",
        description: "Name of the launchpad to pause",
        required: true,
      },
    ],
    handler: async ({ name }) => {
      const pauseRequest = {
        name,
      };

      await pauseLaunchpad.mutateAsync(pauseRequest);
      return `Launchpad '${name}' paused successfully.`;
    },
  });
}

function checkReadyLaunchpadAction(context: SealosApiContext) {
  const checkReadyLaunchpad = useCheckReadyLaunchpadMutation(context);

  useCopilotAction({
    name: "checkLaunchpadReady",
    description: "Check if a launchpad is ready",
    parameters: [
      {
        name: "name",
        type: "string",
        description: "Name of the launchpad to check readiness for",
        required: true,
      },
    ],
    handler: async ({ name }) => {
      const checkRequest = {
        name,
      };

      const result = await checkReadyLaunchpad.mutateAsync(checkRequest);
      const readyCount = result.data.filter((item: any) => item.ready).length;

      return `Launchpad '${name}' readiness check: ${readyCount}/${result.data.length} endpoints ready.`;
    },
  });
}

function listLaunchpadAction(context: K8sApiContext) {
  const queryClient = useQueryClient();

  useCopilotAction({
    name: "listLaunchpads",
    description: "List all launchpads (deployments and statefulsets)",
    parameters: [],
    handler: async () => {
      const launchpads = await queryClient.fetchQuery(
        listLaunchpadOptions(context)
      );

      if (!launchpads || launchpads.length === 0) {
        return "No launchpads found.";
      }

      const launchpadNames = launchpads
        .map((launchpad: any) => launchpad.metadata?.name)
        .filter(Boolean);

      return `Found ${launchpadNames.length} launchpads: ${launchpadNames.join(
        ", "
      )}`;
    },
  });
}

function getLaunchpadAction(context: K8sApiContext) {
  const queryClient = useQueryClient();

  useCopilotAction({
    name: "getLaunchpad",
    description: "Get details of a specific launchpad",
    parameters: [
      {
        name: "name",
        type: "string",
        description: "Name of the launchpad to get details for",
        required: true,
      },
      {
        name: "resourceType",
        type: "string",
        description: "Type of resource (deployment or statefulset)",
        required: false,
      },
    ],
    handler: async ({ name, resourceType }) => {
      const type = resourceType || "deployment";
      const target = BuiltinResourceTargetSchema.parse({
        ...convertResourceTypeToTarget(type),
        name,
      });

      const launchpad = await queryClient.fetchQuery(
        getLaunchpadOptions(context, target)
      );

      return `Launchpad '${name}' details: Status: ${
        (launchpad as any).status?.readyReplicas || 0
      }/${(launchpad as any).spec?.replicas || 0} replicas ready, Image: ${
        (launchpad as any).spec?.template?.spec?.containers?.[0]?.image ||
        "Unknown"
      }`;
    },
  });
}

function getLaunchpadLogsAction(
  context: K8sApiContext,
  sealosContext: SealosApiContext
) {
  const queryClient = useQueryClient();

  useCopilotAction({
    name: "getLaunchpadLogs",
    description: "Get logs of a specific launchpad",
    parameters: [
      {
        name: "name",
        type: "string",
        description: "Name of the launchpad to get logs for",
        required: true,
      },
    ],
    handler: async ({ name }) => {
      const target = BuiltinResourceTargetSchema.parse({
        ...convertResourceTypeToTarget("deployment"),
        name,
      });

      const logs = await queryClient.fetchQuery(
        getLaunchpadLogsOptions(context, sealosContext, target)
      );
      console.log("logs in ai-launchpad-actions", JSON.stringify(logs));
      return `Launchpad '${name}' logs: ${JSON.stringify(logs)}`;
    },
  });
}
// TODO: Implement additional app actions if needed
// export const setAppCommandAction = async () => {};
// export const setAppEnvAction = async () => {};
// export const setAppPortAction = async () => {};
// export const setAppVolumeAction = async () => {};
// export const getAppYamlAction = async () => {};
