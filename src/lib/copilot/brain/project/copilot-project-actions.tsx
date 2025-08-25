import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { useCopilotAction } from "@copilotkit/react-core";
import {
  AITool,
  AIToolContent,
  AIToolHeader,
  AIToolParameters,
  AIToolResult,
} from "@/components/shadcn-io/ai/tool";
import { AIResponse } from "@/components/shadcn-io/ai/response";
import {
  ProjectProposalCard,
  type ProjectProposal,
} from "@/components/chat/state-cards/project-proposal";

export const activateProjectActions = (context: K8sApiContext) => {
  proposeProjectAction(context);
};

export const proposeProjectAction = (context: K8sApiContext) => {
  useCopilotAction({
    name: "propose_project",
    available: "disabled",
    render: ({ status, args, result }) => {
      // Parse the result as ProjectProposal if it exists
      let projectProposal: ProjectProposal | null = null;
      if (result) {
        try {
          // If result is already an object, use it directly
          if (typeof result === "object" && result !== null) {
            projectProposal = result as ProjectProposal;
          } else {
            // If result is a string, try to parse it as JSON
            projectProposal = JSON.parse(result as string) as ProjectProposal;
          }
        } catch (error) {
          console.error("Failed to parse project proposal:", error);
        }
      }

      // Only render when we have a valid project proposal
      if (projectProposal) {
        return <ProjectProposalCard proposal={projectProposal} />;
      }

      // Return empty div if no valid proposal data
      return <div />;
    },
  });
};

export const addResourcesAction = () => {};

export const deleteResourcesAction = () => {};

export const connectResourcesAction = () => {};

export const disconnectResourcesAction = () => {};
