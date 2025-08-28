import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { useCopilotAction } from "@copilotkit/react-core";
import {
  ProjectProposal,
  ProjectProposalSchema,
} from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
import { ProjectProposalCard } from "@/components/chat/state-cards/project-proposal/project-proposal-card";

export const activateProjectActions = (context: K8sApiContext) => {
  proposeProjectAction(context);
};

export const proposeProjectAction = (context: K8sApiContext) => {
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
        return <ProjectProposalCard proposal={proposal} />;
      } catch (error) {
        console.error("Failed to parse project proposal:", error);
        return <div />;
      }
    },
  });
};

export const addResourcesAction = () => {};

export const deleteResourcesAction = () => {};

export const connectResourcesAction = () => {};

export const disconnectResourcesAction = () => {};
