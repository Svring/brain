"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import {
  useCreateLaunchpadMutation,
  useDeleteLaunchpadMutation,
  usePauseLaunchpadMutation,
  useStartLaunchpadMutation,
  useCheckReadyLaunchpadMutation,
  useUpdateLaunchpadMutation,
} from "@/lib/sealos/resources/launchpad/launchpad-method/launchpad-mutation";
import {
  listLaunchpadOptions,
  getLaunchpadOptions,
  getLaunchpadLogsOptions,
} from "@/lib/sealos/resources/launchpad/launchpad-method/launchpad-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { jsonSchemaToActionParameters } from "@copilotkit/shared";
import { zodToJsonSchema } from "zod-to-json-schema";
import { launchpadCreateFormSchema } from "@/schemas/forms/launchpad/launchpad-create-form-schema";
import { LaunchpadCreateActionMessage } from "@/components/copilot/sealos/launchpad/launchpad-create-action-message";
import { LaunchpadCreateFormData } from "@/schemas/forms/launchpad/launchpad-create-form-schema";
import { LaunchpadUpdateForm } from "@/components/forms/launchpad/launchpad-update-form";
import { UpdateImageForm } from "@/components/copilot/sealos/launchpad/update-image-form";
import { AddPortsForm } from "@/components/copilot/sealos/launchpad/add-ports-form";
import { DeletePortsForm } from "@/components/copilot/sealos/launchpad/delete-ports-form";
import {
  CPU_OPTIONS,
  MEMORY_OPTIONS,
  REPLICAS_OPTIONS,
} from "@/lib/k8s/k8s-constant/k8s-constant-resource";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { LaunchpadPortsCreateRequestSchema } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-open-api-schemas/launchpad-create-schema";
import { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";

export function activateLaunchpadActions(
  sealosContext: SealosApiContext,
  k8sContext: K8sApiContext
) {
  createLaunchpadAction(sealosContext);
  updateLaunchpadResourceAction(sealosContext);
  updateLaunchpadImageAction(sealosContext);
  addLaunchpadPortsAction(sealosContext);
  // deleteLaunchpadPortsAction(sealosContext);
  // deleteLaunchpadAction(sealosContext);
  // startLaunchpadAction(sealosContext);
  // pauseLaunchpadAction(sealosContext);
  // checkReadyLaunchpadAction(sealosContext);
  // listLaunchpadAction(k8sContext);
  // getLaunchpadAction(k8sContext);
  // getLaunchpadLogsAction(k8sContext, sealosContext);
}

function updateLaunchpadResourceAction(context: SealosApiContext) {
  const updateLaunchpad = useUpdateLaunchpadMutation(context);

  useCopilotAction({
    name: "updateLaunchpadResource",
    description:
      "Update the resource quota of a launchpad app, only pass parameters that need to be updated.",
    parameters: [
      {
        name: "name",
        type: "string",
        description: "Name of the launchpad app to update",
        required: true,
      },
      {
        name: "cpu",
        type: "string",
        required: false,
        enum: CPU_OPTIONS.map(String),
        description: "desired CPU quota of the launchpad app",
      },
      {
        name: "memory",
        type: "string",
        required: false,
        enum: MEMORY_OPTIONS.map(String),
        description: "desired memory quota of the launchpad app",
      },
      {
        name: "replicas",
        type: "string",
        required: false,
        enum: REPLICAS_OPTIONS.map(String),
        description: "desired replicas of the launchpad app",
      },
    ],
    renderAndWaitForResponse(props) {
      const { args, respond, status } = props;
      const { name, cpu, memory, replicas } = args;

      const handleSubmit = async (data: LaunchpadUpdateFormData) => {
        try {
          // Build the update request with only the provided resource fields
          const updateRequest = {
            name: name || "",
            data: {
              resource: {
                ...(cpu !== undefined && { cpu: Number(cpu) }),
                ...(memory !== undefined && { memory: Number(memory) }),
                ...(replicas !== undefined && { replicas: Number(replicas) }),
              },
            },
          };

          await updateLaunchpad.mutateAsync(updateRequest);

          if (respond) {
            respond("Launchpad resources updated successfully.");
          }
        } catch (error) {
          console.error("Failed to update launchpad resources:", error);
          if (respond) {
            respond("Failed to update launchpad resources.");
          }
        }
      };

      // Build default values for the form - only include fields that were provided
      const defaultValues: Partial<LaunchpadUpdateFormData> = {};

      if (cpu !== undefined || memory !== undefined || replicas !== undefined) {
        defaultValues.resource = {
          ...(cpu !== undefined && { cpu: Number(cpu) }),
          ...(memory !== undefined && { memory: Number(memory) }),
          ...(replicas !== undefined && { replicas: Number(replicas) }),
        };
      }

      // Determine loading state based on status
      const isLoading = status === "inProgress";

      // Show completion message when status is complete
      if (status === "complete") {
        return (
          <div className="w-full p-4">
            <div className="flex items-center justify-center p-8">
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-muted-foreground text-center">
                  The resource quota has been updated for the launchpad app.
                </p>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="w-full p-4">
          <LaunchpadUpdateForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            hideDefaultButton={false}
          />
        </div>
      );
    },
  });
}

function updateLaunchpadImageAction(context: SealosApiContext) {
  useCopilotAction({
    name: "updateLaunchpadImage",
    description: "Update the image of a launchpad app.",
    parameters: [
      {
        name: "name",
        type: "string",
        description: "Name of the launchpad app to update",
        required: true,
      },
      {
        name: "image",
        type: "string",
        required: false,
        description:
          "desired image URL for the launchpad app (e.g., nginx:latest)",
      },
    ],
    renderAndWaitForResponse(props) {
      const { args, respond } = props;
      const { name, image } = args;

      const handleSubmit = (values: { name: string; image: string }) => {
        if (respond) {
          respond("updated successfully.");
        }
      };

      return (
        <UpdateImageForm
          initialValues={{
            name: name || "",
            image: image || "",
          }}
          onSubmit={handleSubmit}
          context={context}
        />
      );
    },
  });
}

function addLaunchpadPortsAction(context: SealosApiContext) {
  useCopilotAction({
    name: "addLaunchpadPorts",
    description: "Add ports to a launchpad app",
    parameters: [
      {
        name: "name",
        type: "string",
        description: "Name of the launchpad app to add ports to",
        required: true,
      },
      {
        name: "ports",
        type: "object[]",
        description: "Array of port configurations to add",
        required: true,
        attributes: [
          {
            name: "port",
            type: "number",
            description: "The port number to add",
          },
          {
            name: "exposesPublicDomain",
            type: "boolean",
            description: "Whether the port exposes a public domain",
          },
        ],
      },
    ],
    renderAndWaitForResponse(props: any) {
      const { args, respond } = props;
      const { name, ports } = args;

      // Parse args with schema to get default values
      const parsedPorts = ports
        ? LaunchpadPortsCreateRequestSchema.parse({ ports })
        : { ports: [] };

      const handleSubmit = (values: { name: string; ports: any[] }) => {
        if (respond) {
          respond("Ports added successfully.");
        }
      };

      return (
        <AddPortsForm
          initialValues={{
            name: name || "",
            ports: parsedPorts.ports,
          }}
          onSubmit={handleSubmit}
          context={context}
        />
      );
    },
  });
}

// function deleteLaunchpadPortsAction(context: SealosApiContext) {
//   useCopilotAction({
//     name: "deleteLaunchpadPorts",
//     description: "Delete ports from a launchpad app",
//     parameters: [
//       {
//         name: "name",
//         type: "string",
//         description: "Name of the launchpad app to delete ports from",
//         required: true,
//       },
//       {
//         name: "ports",
//         type: "number[]",
//         description: "Array of port numbers to delete",
//         required: true,
//       },
//     ],
//     renderAndWaitForResponse(props: any) {
//       const { args, respond } = props;
//       const { name, ports } = args;

//       const handleSubmit = (values: { name: string; ports: number[] }) => {
//         if (respond) {
//           respond("Ports deleted successfully.");
//         }
//       };

//       return (
//         <DeletePortsForm
//           initialValues={{
//             name: name || "",
//             ports: ports || [],
//           }}
//           onSubmit={handleSubmit}
//           context={context}
//         />
//       );
//     },
//   });
// }

function createLaunchpadAction(context: SealosApiContext) {
  useCopilotAction({
    name: "createLaunchpad",
    description: "Create a new launchpad with specified configuration",
    followUp: false,
    parameters: jsonSchemaToActionParameters(
      zodToJsonSchema(launchpadCreateFormSchema) as any
    ),
    renderAndWaitForResponse: (props) => {
      return (
        <LaunchpadCreateActionMessage
          args={props.args as Partial<LaunchpadCreateFormData>}
          respond={props.respond}
          status={props.status}
        />
      );
    },
  });
}

// function deleteLaunchpadAction(context: SealosApiContext) {
//   const deleteLaunchpad = useDeleteLaunchpadMutation(context);

//   useCopilotAction({
//     name: "deleteLaunchpad",
//     description: "Delete a launchpad",
//     parameters: [
//       {
//         name: "name",
//         type: "string",
//         description: "Name of the launchpad to delete",
//         required: true,
//       },
//     ],
//     handler: async ({ name }) => {
//       const deleteRequest = {
//         name,
//       };

//       await deleteLaunchpad.mutateAsync(deleteRequest);
//       return `Launchpad '${name}' deleted successfully.`;
//     },
//     render: ({ args, result, status }) => {
//       return (
//         <AITool key={"deleteLaunchpad"}>
//           <AIToolHeader
//             description={"Delete a launchpad"}
//             name={"deleteLaunchpad"}
//             status={status}
//           />
//           <AIToolContent>
//             <AIToolParameters parameters={args} />
//             {result && (
//               <AIToolResult result={<AIResponse>{result}</AIResponse>} />
//             )}
//           </AIToolContent>
//         </AITool>
//       );
//     },
//   });
// }

// function startLaunchpadAction(context: SealosApiContext) {
//   const startLaunchpad = useStartLaunchpadMutation(context);

//   useCopilotAction({
//     name: "startLaunchpad",
//     description: "Start a launchpad",
//     parameters: [
//       {
//         name: "name",
//         type: "string",
//         description: "Name of the launchpad to start",
//         required: true,
//       },
//     ],
//     handler: async ({ name }) => {
//       const startRequest = {
//         name,
//       };

//       await startLaunchpad.mutateAsync(startRequest);
//       return `Launchpad '${name}' started successfully.`;
//     },
//     render: ({ args, result, status }) => {
//       return (
//         <AITool key={"startLaunchpad"}>
//           <AIToolHeader
//             description={"Start a launchpad"}
//             name={"startLaunchpad"}
//             status={status}
//           />
//           <AIToolContent>
//             <AIToolParameters parameters={args} />
//             {result && (
//               <AIToolResult result={<AIResponse>{result}</AIResponse>} />
//             )}
//           </AIToolContent>
//         </AITool>
//       );
//     },
//   });
// }

// function pauseLaunchpadAction(context: SealosApiContext) {
//   const pauseLaunchpad = usePauseLaunchpadMutation(context);

//   useCopilotAction({
//     name: "pauseLaunchpad",
//     description: "Pause a launchpad",
//     parameters: [
//       {
//         name: "name",
//         type: "string",
//         description: "Name of the launchpad to pause",
//         required: true,
//       },
//     ],
//     handler: async ({ name }) => {
//       const pauseRequest = {
//         name,
//       };

//       await pauseLaunchpad.mutateAsync(pauseRequest);
//       return `Launchpad '${name}' paused successfully.`;
//     },
//     render: ({ args, result, status }) => {
//       return (
//         <AITool key={"pauseLaunchpad"}>
//           <AIToolHeader
//             description={"Pause a launchpad"}
//             name={"pauseLaunchpad"}
//             status={status}
//           />
//           <AIToolContent>
//             <AIToolParameters parameters={args} />
//             {result && (
//               <AIToolResult result={<AIResponse>{result}</AIResponse>} />
//             )}
//           </AIToolContent>
//         </AITool>
//       );
//     },
//   });
// }

// function checkReadyLaunchpadAction(context: SealosApiContext) {
//   const checkReadyLaunchpad = useCheckReadyLaunchpadMutation(context);

//   useCopilotAction({
//     name: "checkLaunchpadReady",
//     description: "Check if a launchpad is ready",
//     parameters: [
//       {
//         name: "name",
//         type: "string",
//         description: "Name of the launchpad to check readiness for",
//         required: true,
//       },
//     ],
//     handler: async ({ name }) => {
//       const checkRequest = {
//         name,
//       };

//       const result = await checkReadyLaunchpad.mutateAsync(checkRequest);
//       const readyCount = result.data.filter((item: any) => item.ready).length;

//       return `Launchpad '${name}' readiness check: ${readyCount}/${result.data.length} endpoints ready.`;
//     },
//     render: ({ args, result, status }) => {
//       return (
//         <AITool key={"checkLaunchpadReady"}>
//           <AIToolHeader
//             description={"Check if a launchpad is ready"}
//             name={"checkLaunchpadReady"}
//             status={status}
//           />
//           <AIToolContent>
//             <AIToolParameters parameters={args} />
//             {result && (
//               <AIToolResult result={<AIResponse>{result}</AIResponse>} />
//             )}
//           </AIToolContent>
//         </AITool>
//       );
//     },
//   });
// }

// function listLaunchpadAction(context: K8sApiContext) {
//   const queryClient = useQueryClient();

//   useCopilotAction({
//     name: "listLaunchpads",
//     description: "List all launchpads (deployments and statefulsets)",
//     parameters: [],
//     handler: async () => {
//       const launchpads = await queryClient.fetchQuery(
//         listLaunchpadOptions(context)
//       );

//       if (!launchpads || launchpads.length === 0) {
//         return "No launchpads found.";
//       }

//       const launchpadNames = launchpads
//         .map((launchpad: any) => launchpad.metadata?.name)
//         .filter(Boolean);

//       return `Found ${launchpadNames.length} launchpads: ${launchpadNames.join(
//         ", "
//       )}`;
//     },
//     render: ({ args, result, status }) => {
//       return (
//         <AITool key={"listLaunchpads"}>
//           <AIToolHeader
//             description={"List all launchpads (deployments and statefulsets)"}
//             name={"listLaunchpads"}
//             status={status}
//           />
//           <AIToolContent>
//             <AIToolParameters parameters={args} />
//             {result && (
//               <AIToolResult result={<AIResponse>{result}</AIResponse>} />
//             )}
//           </AIToolContent>
//         </AITool>
//       );
//     },
//   });
// }

// function getLaunchpadAction(context: K8sApiContext) {
//   const queryClient = useQueryClient();

//   useCopilotAction({
//     name: "getLaunchpad",
//     description: "Get details of a specific launchpad",
//     parameters: [
//       {
//         name: "name",
//         type: "string",
//         description: "Name of the launchpad to get details for",
//         required: true,
//       },
//       {
//         name: "resourceType",
//         type: "string",
//         description: "Type of resource (deployment or statefulset)",
//         required: false,
//       },
//     ],
//     handler: async ({ name, resourceType }) => {
//       const type = resourceType || "deployment";
//       const target = BuiltinResourceTargetSchema.parse({
//         ...convertResourceTypeToTarget(type),
//         name,
//       });

//       const launchpad = await queryClient.fetchQuery(
//         getLaunchpadOptions(context, target)
//       );

//       return `Launchpad '${name}' details: Status: ${
//         (launchpad as any).status?.readyReplicas || 0
//       }/${(launchpad as any).spec?.replicas || 0} replicas ready, Image: ${
//         (launchpad as any).spec?.template?.spec?.containers?.[0]?.image ||
//         "Unknown"
//       }`;
//     },
//     render: ({ args, result, status }) => {
//       return (
//         <AITool key={"getLaunchpad"}>
//           <AIToolHeader
//             description={"Get details of a specific launchpad"}
//             name={"getLaunchpad"}
//             status={status}
//           />
//           <AIToolContent>
//             <AIToolParameters parameters={args} />
//             {result && (
//               <AIToolResult result={<AIResponse>{result}</AIResponse>} />
//             )}
//           </AIToolContent>
//         </AITool>
//       );
//     },
//   });
// }

// function getLaunchpadLogsAction(
//   context: K8sApiContext,
//   sealosContext: SealosApiContext
// ) {
//   const queryClient = useQueryClient();

//   useCopilotAction({
//     name: "getLaunchpadLogs",
//     description: "Get logs of a specific launchpad",
//     parameters: [
//       {
//         name: "name",
//         type: "string",
//         description: "Name of the launchpad to get logs for",
//         required: true,
//       },
//     ],
//     handler: async ({ name }) => {
//       const target = BuiltinResourceTargetSchema.parse({
//         ...convertResourceTypeToTarget("deployment"),
//         name,
//       });

//       const logs = await queryClient.fetchQuery(
//         getLaunchpadLogsOptions(context, sealosContext, target)
//       );
//       console.log("logs in ai-launchpad-actions", JSON.stringify(logs));
//       return `Launchpad '${name}' logs: ${JSON.stringify(logs)}`;
//     },
//     render: ({ args, result, status }) => {
//       return (
//         <AITool key={"getLaunchpadLogs"}>
//           <AIToolHeader
//             description={"Get logs of a specific launchpad"}
//             name={"getLaunchpadLogs"}
//             status={status}
//           />
//           <AIToolContent>
//             <AIToolParameters parameters={args} />
//             {result && (
//               <AIToolResult result={<AIResponse>{result}</AIResponse>} />
//             )}
//           </AIToolContent>
//         </AITool>
//       );
//     },
//   });
// }
// TODO: Implement additional app actions if needed
// export const setAppCommandAction = async () => {};
// export const setAppEnvAction = async () => {};
// export const setAppPortAction = async () => {};
// export const setAppVolumeAction = async () => {};
// export const getAppYamlAction = async () => {};
