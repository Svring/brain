"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import {
  useCreateAppMutation,
  useDeleteAppMutation,
  usePauseAppMutation,
  useStartAppMutation,
  useCheckReadyAppMutation,
} from "@/lib/sealos/app/app-method/app-mutation";
import {
  listAppOptions,
  getAppOptions,
  queryAppLogsOptions,
} from "@/lib/sealos/app/app-method/app-query";
import { useQueryClient } from "@tanstack/react-query";
import { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { BuiltinResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

export function activateAppActions(
  sealosContext: SealosApiContext,
  k8sContext: K8sApiContext
) {
  createAppAction(sealosContext);
  deleteAppAction(sealosContext);
  startAppAction(sealosContext);
  stopAppAction(sealosContext);
  checkReadyAppAction(sealosContext);
  listAppAction(k8sContext);
  getAppAction(k8sContext);
}

function createAppAction(context: SealosApiContext) {
  const createApp = useCreateAppMutation(context);

  useCopilotAction({
    name: "createApp",
    description: "Create a new application",
    parameters: [
      {
        name: "appName",
        type: "string",
        description: "Name of the application to create",
        required: true,
      },
      {
        name: "imageName",
        type: "string",
        description: "Docker image name for the application",
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
    handler: async ({ appName, imageName, cpu, memory, replicas }) => {
      const createRequest = {
        name: appName,
        image: imageName,
        env: {},
        ports: [],
        cpu: cpu || 1000,
        memory: memory || 1024,
        replicas: replicas || 1,
      };

      await createApp.mutateAsync(createRequest);
      return `Application '${appName}' created successfully with image '${imageName}'.`;
    },
  });
}

function deleteAppAction(context: SealosApiContext) {
  const deleteApp = useDeleteAppMutation(context);

  useCopilotAction({
    name: "deleteApp",
    description: "Delete an application",
    parameters: [
      {
        name: "appName",
        type: "string",
        description: "Name of the application to delete",
        required: true,
      },
    ],
    handler: async ({ appName }) => {
      const deleteRequest = {
        name: appName,
      };

      await deleteApp.mutateAsync(deleteRequest);
      return `Application '${appName}' deleted successfully.`;
    },
  });
}

function startAppAction(context: SealosApiContext) {
  const startApp = useStartAppMutation(context);

  useCopilotAction({
    name: "startApp",
    description: "Start an application",
    parameters: [
      {
        name: "appName",
        type: "string",
        description: "Name of the application to start",
        required: true,
      },
    ],
    handler: async ({ appName }) => {
      const startRequest = {
        appName,
      };

      await startApp.mutateAsync(startRequest);
      return `Application '${appName}' started successfully.`;
    },
  });
}

function stopAppAction(context: SealosApiContext) {
  const pauseApp = usePauseAppMutation(context);

  useCopilotAction({
    name: "stopApp",
    description: "Stop (pause) an application",
    parameters: [
      {
        name: "appName",
        type: "string",
        description: "Name of the application to stop",
        required: true,
      },
    ],
    handler: async ({ appName }) => {
      const pauseRequest = {
        appName,
      };

      await pauseApp.mutateAsync(pauseRequest);
      return `Application '${appName}' stopped successfully.`;
    },
  });
}

function checkReadyAppAction(context: SealosApiContext) {
  const checkReadyApp = useCheckReadyAppMutation(context);

  useCopilotAction({
    name: "checkAppReady",
    description: "Check if an application is ready",
    parameters: [
      {
        name: "appName",
        type: "string",
        description: "Name of the application to check readiness for",
        required: true,
      },
    ],
    handler: async ({ appName }) => {
      const checkRequest = {
        appName,
      };

      const result = await checkReadyApp.mutateAsync(checkRequest);
      const readyCount = result.data.filter((item: any) => item.ready).length;

      return `Application '${appName}' readiness check: ${readyCount}/${result.data.length} endpoints ready.`;
    },
  });
}

function listAppAction(context: K8sApiContext) {
  const queryClient = useQueryClient();

  useCopilotAction({
    name: "listApps",
    description: "List all applications (deployments and statefulsets)",
    parameters: [],
    handler: async () => {
      const apps = await queryClient.fetchQuery(listAppOptions(context));

      if (!apps || apps.length === 0) {
        return "No applications found.";
      }

      const appNames = apps
        .map((app: any) => app.metadata?.name)
        .filter(Boolean);

      return `Found ${appNames.length} applications: ${appNames.join(", ")}`;
    },
  });
}

function getAppAction(context: K8sApiContext) {
  const queryClient = useQueryClient();

  useCopilotAction({
    name: "getApp",
    description: "Get details of a specific application",
    parameters: [
      {
        name: "appName",
        type: "string",
        description: "Name of the application to get details for",
        required: true,
      },
      {
        name: "resourceType",
        type: "string",
        description: "Type of resource (deployment or statefulset)",
        required: false,
      },
    ],
    handler: async ({ appName, resourceType }) => {
      const type = resourceType || "deployment";
      const target = BuiltinResourceTargetSchema.parse({
        ...convertResourceTypeToTarget(type),
        name: appName,
      });

      const app = await queryClient.fetchQuery(getAppOptions(context, target));

      return `Application '${appName}' details: Status: ${
        (app as any).status?.readyReplicas || 0
      }/${(app as any).spec?.replicas || 0} replicas ready, Image: ${
        (app as any).spec?.template?.spec?.containers?.[0]?.image || "Unknown"
      }`;
    },
  });
}

// TODO: Implement additional app actions if needed
// export const setAppCommandAction = async () => {};
// export const setAppEnvAction = async () => {};
// export const setAppPortAction = async () => {};
// export const setAppVolumeAction = async () => {};
// export const getAppYamlAction = async () => {};
