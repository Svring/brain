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
    description: "Create a new cluster/database with specified configuration",
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
  const { selectedResource } = useProjectState();
  
  // Check if the selected resource is a cluster/database
  const isClusterResource = selectedResource?.resourceType === "cluster";
  const isAvailable = stage === "manage_resource" && isClusterResource;
  
  useCopilotAction({
    name: "updateCluster",
    description: "Update a cluster/database configuration (resource, etc.)",
    available: isAvailable ? "enabled" : "disabled",
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
  const { selectedResource } = useProjectState();
  
  // Check if the selected resource is a cluster/database
  const isClusterResource = selectedResource?.resourceType === "cluster";
  const isAvailable = stage === "manage_resource" && isClusterResource;
  
  useCopilotAction({
    name: "clusterLifecycle",
    description: "Manage cluster/database lifecycle (start, pause)",
    available: isAvailable ? "enabled" : "disabled",
    parameters: [
      {
        name: "clusterName",
        type: "string",
        required: true,
        description: "Name of the cluster/database",
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

  // Check if the selected resource is a cluster/database
  const isClusterResource = selectedResource?.resourceType === "cluster";
  const isAvailable = stage === "manage_resource" && isClusterResource;

  useCopilotAction({
    name: "getClusterData",
    available: isAvailable ? "enabled" : "disabled",
    description: "Get detailed information about the currently selected cluster/database",
    handler: async () => {
      if (!selectedResource || selectedResource.resourceType !== "cluster") {
        throw new Error("No cluster/database resource selected. Please select a cluster/database first.");
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
                  Successfully retrieved cluster/database data for "{result.resourceName}"
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
