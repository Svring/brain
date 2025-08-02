"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import {
  useCreateAppMutation,
  useDeleteAppMutation,
  usePauseAppMutation,
  useStartAppMutation,
  useCheckReadyAppMutation,
} from "@/lib/sealos/app/app-method/app-mutation";
import { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";

export function activateAppActions(context: SealosApiContext) {
  createAppAction(context);
  deleteAppAction(context);
  startAppAction(context);
  stopAppAction(context);
  checkReadyAppAction(context);
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

// TODO: Implement additional app actions if needed
// export const setAppCommandAction = async () => {};
// export const setAppEnvAction = async () => {};
// export const setAppPortAction = async () => {};
// export const setAppVolumeAction = async () => {};
// export const getAppYamlAction = async () => {};
