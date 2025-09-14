import { useCopilotAction } from "@copilotkit/react-core";
import {
  ProjectProposal,
  ProjectProposalSchema,
} from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
import { ProjectProposalPresentation } from "@/components/chat/state-cards/project-proposal/project-proposal-presentation";
import { ProjectLogsActionMessage } from "@/components/copilot/brain/project/project-logs-action-message";
import { useFlowgraphResources } from "@/hooks/flowgraph/use-flowgraph-resources";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useQueryClient } from "@tanstack/react-query";

export const activateProjectActions = () => {
  proposeProjectAction();
  // checkAllLogsAction();
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
        return <ProjectProposalPresentation proposal={proposal} />;
      } catch (error) {
        console.error("Failed to parse project proposal:", error);
        return <div />;
      }
    },
  });
};

export const checkAllLogsAction = () => {
  const { project } = useTRPCClients();
  const queryClient = useQueryClient();
  const { clusterResources, launchpadResources } = useFlowgraphResources();

  useCopilotAction({
    name: "check_all_logs",
    description:
      "Check all recent logs for the project to see if there are any errors or warnings.",
    available: "enabled",
    handler: async () => {
      const response = await queryClient.fetchQuery(
        project.allLogs.queryOptions({
          clusterResources,
          launchpadResources,
        })
      );
      return response.logs;
    },
    render: ({ result, status }) => {
      return <ProjectLogsActionMessage result={result} status={status} />;
    },
  });
};
