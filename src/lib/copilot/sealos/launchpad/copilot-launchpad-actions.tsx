"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import {
  useCreateLaunchpadMutation,
  useDeleteLaunchpadMutation,
  usePauseLaunchpadMutation,
  useStartLaunchpadMutation,
  useCheckReadyLaunchpadMutation,
} from "@/lib/sealos/resources/launchpad/launchpad-method/launchpad-mutation";
import {
  listLaunchpadOptions,
  getLaunchpadOptions,
  getLaunchpadLogsOptions,
} from "@/lib/sealos/resources/launchpad/launchpad-method/launchpad-query";
import { useQueryClient } from "@tanstack/react-query";
import { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { BuiltinResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import {
  AITool,
  AIToolContent,
  AIToolHeader,
  AIToolParameters,
  AIToolResult,
} from "@/components/shadcn-io/ai/tool";
import { AIResponse } from "@/components/shadcn-io/ai/response";
import { jsonSchemaToActionParameters } from "@copilotkit/shared";
import { zodToJsonSchema } from "zod-to-json-schema";
import LaunchpadCreateMessage from "@/components/chat/messages/system-messages.tsx/launchpad/components/launchpad-create";
import { launchpadFormSchema } from "@/components/chat/messages/system-messages.tsx/launchpad/components/launchpad-create/types";

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
  useCopilotAction({
    name: "createLaunchpad",
    description: "Create a new launchpad with specified configuration",
    followUp: false,
    parameters: jsonSchemaToActionParameters(
      zodToJsonSchema(launchpadFormSchema) as any
    ),
    handler: ({ name, image, cpu, memory, replicas }) => {
      // This will be handled by the UI component
      return `Creating launchpad "${name}" with image ${image}`;
    },
    render: ({ status, args }) => {
      // Always render the component, but pass undefined for incomplete parameters
      return (
        <LaunchpadCreateMessage
          payload={{
            name: typeof args.name === "string" ? args.name : undefined,
            image: typeof args.image === "string" ? args.image : undefined,
            command:
              typeof args.command === "string" ? args.command : undefined,
            args: typeof args.args === "string" ? args.args : undefined,
            cpu: typeof args.cpu === "string" ? parseInt(args.cpu) : undefined,
            memory:
              typeof args.memory === "string"
                ? parseInt(args.memory)
                : undefined,
            replicas:
              typeof args.replicas === "string"
                ? parseInt(args.replicas)
                : undefined,
            ports: typeof args.ports === "string" ? args.ports : undefined,
            portProtocol:
              typeof args.portProtocol === "string"
                ? (args.portProtocol as "TCP" | "UDP" | "SCTP")
                : undefined,
            appProtocol:
              typeof args.appProtocol === "string"
                ? (args.appProtocol as "HTTP" | "GRPC" | "WS")
                : undefined,
            exposesPublicDomain:
              typeof args.exposesPublicDomain === "boolean"
                ? args.exposesPublicDomain
                : undefined,
            envVars:
              typeof args.envVars === "string" ? args.envVars : undefined,
            storageName:
              typeof args.storageName === "string"
                ? args.storageName
                : undefined,
            storagePath:
              typeof args.storagePath === "string"
                ? args.storagePath
                : undefined,
            storageSize:
              typeof args.storageSize === "string"
                ? (args.storageSize as
                    | "1Gi"
                    | "5Gi"
                    | "10Gi"
                    | "20Gi"
                    | "50Gi"
                    | "100Gi")
                : undefined,
            configMapPath:
              typeof args.configMapPath === "string"
                ? args.configMapPath
                : undefined,
            configMapValue:
              typeof args.configMapValue === "string"
                ? args.configMapValue
                : undefined,
          }}
        />
      );
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
    render: ({ args, result, status }) => {
      return (
        <AITool key={"deleteLaunchpad"}>
          <AIToolHeader
            description={"Delete a launchpad"}
            name={"deleteLaunchpad"}
            status={status}
          />
          <AIToolContent>
            <AIToolParameters parameters={args} />
            {result && (
              <AIToolResult result={<AIResponse>{result}</AIResponse>} />
            )}
          </AIToolContent>
        </AITool>
      );
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
    render: ({ args, result, status }) => {
      return (
        <AITool key={"startLaunchpad"}>
          <AIToolHeader
            description={"Start a launchpad"}
            name={"startLaunchpad"}
            status={status}
          />
          <AIToolContent>
            <AIToolParameters parameters={args} />
            {result && (
              <AIToolResult result={<AIResponse>{result}</AIResponse>} />
            )}
          </AIToolContent>
        </AITool>
      );
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
    render: ({ args, result, status }) => {
      return (
        <AITool key={"pauseLaunchpad"}>
          <AIToolHeader
            description={"Pause a launchpad"}
            name={"pauseLaunchpad"}
            status={status}
          />
          <AIToolContent>
            <AIToolParameters parameters={args} />
            {result && (
              <AIToolResult result={<AIResponse>{result}</AIResponse>} />
            )}
          </AIToolContent>
        </AITool>
      );
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
    render: ({ args, result, status }) => {
      return (
        <AITool key={"checkLaunchpadReady"}>
          <AIToolHeader
            description={"Check if a launchpad is ready"}
            name={"checkLaunchpadReady"}
            status={status}
          />
          <AIToolContent>
            <AIToolParameters parameters={args} />
            {result && (
              <AIToolResult result={<AIResponse>{result}</AIResponse>} />
            )}
          </AIToolContent>
        </AITool>
      );
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
    render: ({ args, result, status }) => {
      return (
        <AITool key={"listLaunchpads"}>
          <AIToolHeader
            description={"List all launchpads (deployments and statefulsets)"}
            name={"listLaunchpads"}
            status={status}
          />
          <AIToolContent>
            <AIToolParameters parameters={args} />
            {result && (
              <AIToolResult result={<AIResponse>{result}</AIResponse>} />
            )}
          </AIToolContent>
        </AITool>
      );
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
    render: ({ args, result, status }) => {
      return (
        <AITool key={"getLaunchpad"}>
          <AIToolHeader
            description={"Get details of a specific launchpad"}
            name={"getLaunchpad"}
            status={status}
          />
          <AIToolContent>
            <AIToolParameters parameters={args} />
            {result && (
              <AIToolResult result={<AIResponse>{result}</AIResponse>} />
            )}
          </AIToolContent>
        </AITool>
      );
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
    render: ({ args, result, status }) => {
      return (
        <AITool key={"getLaunchpadLogs"}>
          <AIToolHeader
            description={"Get logs of a specific launchpad"}
            name={"getLaunchpadLogs"}
            status={status}
          />
          <AIToolContent>
            <AIToolParameters parameters={args} />
            {result && (
              <AIToolResult result={<AIResponse>{result}</AIResponse>} />
            )}
          </AIToolContent>
        </AITool>
      );
    },
  });
}
// TODO: Implement additional app actions if needed
// export const setAppCommandAction = async () => {};
// export const setAppEnvAction = async () => {};
// export const setAppPortAction = async () => {};
// export const setAppVolumeAction = async () => {};
// export const getAppYamlAction = async () => {};
