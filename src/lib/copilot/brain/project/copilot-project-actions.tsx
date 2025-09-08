import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { useCopilotAction } from "@copilotkit/react-core";
import {
  ProjectProposal,
  ProjectProposalSchema,
} from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
// import { ProjectProposalCard } from "@/components/chat/state-cards/project-proposal/project-proposal-card";
import { ProjectProposalPreview } from "@/components/chat/state-cards/project-proposal/project-proposal-preview";
import { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import { getAllProjectLogs } from "@/lib/brain/resources/project/project-api/project-api-service";
import { ProjectLogRender } from "@/components/copilot/brain/project/copilot-project-log";
import { useFlowgraphResources } from "@/hooks/flowgraph/use-flowgraph-resources";

export const activateProjectActions = (
  context: K8sApiContext,
  sealosContext: SealosApiContext
) => {
  proposeProjectAction();
  checkAllLogsAction(context, sealosContext);
};

export const proposeProjectAction = () => {
  useCopilotAction({
    name: "propose_project",
    available: "disabled",
    render: ({ result }) => {
      if (!result) return <div />;
      try {
        // Always parse with schema for validation
        const proposal =
          typeof result === "object" && result !== null
            ? ProjectProposalSchema.parse(result)
            : ProjectProposalSchema.parse(JSON.parse(result as string));
        return <ProjectProposalPreview proposal={proposal} />;
      } catch (error) {
        console.error("Failed to parse project proposal:", error);
        return <div />;
      }
    },
  });
};

export const checkAllLogsAction = (
  k8sContext: K8sApiContext,
  sealosContext: SealosApiContext
) => {
  const { clusterResources, launchpadResources } = useFlowgraphResources();

  useCopilotAction({
    name: "check_all_logs",
    description:
      "Check all recent logs for the project to see if there are any errors or warnings.",
    available: "enabled",
    handler: async () => {
      const response = await getAllProjectLogs(k8sContext, sealosContext, {
        clusterResources,
        launchpadResources,
      });
      return response.logs;
    },
    render: ({ result }) => {
      return <ProjectLogRender result={result} />;
    },
  });
};

export const addResourcesAction = () => {};

export const deleteResourcesAction = () => {};

export const connectResourcesAction = () => {};

export const disconnectResourcesAction = () => {};
