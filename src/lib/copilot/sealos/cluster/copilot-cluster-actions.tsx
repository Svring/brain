import { useCopilotAction } from "@copilotkit/react-core";
import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import {
  AITool,
  AIToolContent,
  AIToolHeader,
  AIToolParameters,
  AIToolResult,
} from "@/components/shadcn-io/ai/tool";
import { AIResponse } from "@/components/shadcn-io/ai/response";
import {
  generateClusterCpuOptions,
  generateClusterMemoryOptions,
  generateClusterStorageOptions,
} from "@/lib/sealos/resources/cluster/cluster-utils";
import { jsonSchemaToActionParameters } from "@copilotkit/shared";
import { zodToJsonSchema } from "zod-to-json-schema";
import { clusterCreateFormSchema } from "@/schemas/forms/cluster/cluster-create-form-schema";
import { ClusterCreateActionMessage } from "@/components/copilot/sealos/cluster/cluster-create-action-message";
import { ClusterCreateFormData } from "@/schemas/forms/cluster/cluster-create-form-schema";
import { ClusterUpdateRuntimeSchema } from "@/lib/copilot/sealos/cluster/copilot-cluster-utils";
import { ClusterUpdateActionMessage } from "@/components/copilot/sealos/cluster/cluster-update-action-message";
import { ClusterLifecycleActionMessage } from "@/components/copilot/sealos/cluster/cluster-lifecycle-action-message";
import { useLanggraphState } from "@/contexts/langgraph/langgraph-context";
import { useProjectState } from "@/contexts/project/project-context";
import { useQueryClient } from "@tanstack/react-query";
import { CircleCheckBigIcon } from "lucide-react";

export const activateClusterActions = () => {
  // CRUD operations
  // createClusterAction();
  updateClusterAction();
  // deleteClusterAction();

  // Lifecycle management
  clusterLifecycleAction();

  // Data retrieval
  getClusterDataAction();
};

export const createClusterAction = () => {
  const { stage } = useLanggraphState();
  useCopilotAction({
    name: "createCluster",
    description: "Create a new database cluster with specified configuration",
    available: stage === "manage_resource" ? "enabled" : "disabled",
    // followUp: false,
    parameters: jsonSchemaToActionParameters(
      zodToJsonSchema(clusterCreateFormSchema) as any
    ),
    renderAndWaitForResponse: (props) => {
      return (
        <ClusterCreateActionMessage
          args={props.args as Partial<ClusterCreateFormData>}
          respond={props.respond}
          status={props.status}
        />
      );
    },
  });
};

export const updateClusterAction = () => {
  const { stage } = useLanggraphState();
  useCopilotAction({
    name: "updateCluster",
    description: "Update a cluster configuration (resource, etc.)",
    available: stage === "manage_resource" ? "enabled" : "disabled",
    // followUp: false,
    parameters: jsonSchemaToActionParameters(
      zodToJsonSchema(ClusterUpdateRuntimeSchema) as any
    ),
    renderAndWaitForResponse: (props) => {
      return (
        <ClusterUpdateActionMessage
          args={props.args as { clusterName: string; [key: string]: any }}
          respond={props.respond}
          status={props.status}
        />
      );
    },
  });
};

export const clusterLifecycleAction = () => {
  const { stage } = useLanggraphState();
  useCopilotAction({
    name: "clusterLifecycle",
    description: "Manage cluster lifecycle (start, pause)",
    available: stage === "manage_resource" ? "enabled" : "disabled",
    parameters: [
      {
        name: "clusterName",
        type: "string",
        required: true,
        description: "Name of the cluster",
      },
      {
        name: "action",
        type: "string",
        required: true,
        description: "Lifecycle action to perform",
        enum: ["start", "pause"],
      },
    ],
    renderAndWaitForResponse: (props) => {
      return (
        <ClusterLifecycleActionMessage
          args={props.args as { clusterName: string }}
          respond={props.respond}
          status={props.status}
          action={props.args.action as "start" | "pause"}
        />
      );
    },
  });
};

export const getClusterDataAction = () => {
  const { stage } = useLanggraphState();
  const { selectedResource } = useProjectState();
  const { cluster } = useTRPCClients();
  const queryClient = useQueryClient();

  useCopilotAction({
    name: "getClusterData",
    available: stage === "manage_resource" ? "enabled" : "disabled",
    description: "Get detailed information about the currently selected cluster",
    handler: async () => {
      if (!selectedResource || selectedResource.resourceType !== "cluster") {
        throw new Error("No cluster resource selected. Please select a cluster first.");
      }

      const result = await queryClient.fetchQuery(
        cluster.get.queryOptions(selectedResource as any)
      );

      return {
        resourceName: selectedResource.name,
        data: result,
      };
    },
    render: ({ result, status }) => {
      if (status === "complete" && result) {
        return (
          <div className="w-full">
            <div className="flex items-center justify-between p-2 border rounded-lg">
              <div className="flex items-center gap-2">
                <CircleCheckBigIcon className="h-4 w-4 text-green-600" />
                <p className="text-sm">
                  Successfully retrieved cluster data for "{result.resourceName}"
                </p>
              </div>
            </div>
          </div>
        );
      }
      return <div />;
    },
  });
};
