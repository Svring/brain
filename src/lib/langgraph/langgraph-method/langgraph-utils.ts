import { v4 as uuidv4 } from "uuid";
import type { ProjectProposal } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
import { devboxCreateFormSchema } from "@/schemas/forms/devbox/devbox-create-form-schema";
import { clusterCreateFormSchema } from "@/schemas/forms/cluster/cluster-create-form-schema";
import { launchpadCreateFormSchema } from "@/schemas/forms/launchpad/launchpad-create-form-schema";

export const TOOL_MESSAGE_NAMES = [
  "propose_image_deployment",
  "propose_devenv_deployment",
  "propose_template_deployment",
];

export function updateToolMessages(
  messages: any[],
  options?: {
    toolMessageNames?: string[];
    skippedResult?: string;
    finalResult?: string;
  }
) {
  const toolMessageNames = options?.toolMessageNames || TOOL_MESSAGE_NAMES;
  const skippedResult = options?.skippedResult || "project proposal skipped";
  const finalResult = options?.finalResult || "project created successfully";

  const updatedMessages = messages.map((message: any) => {
    if (message.type === "tool" && toolMessageNames.includes(message.name)) {
      return {
        ...message,
        additional_kwargs: {
          ...message.additional_kwargs,
          result: skippedResult,
        },
      };
    }
    return message;
  });

  let lastToolMessageIndex = -1;
  for (let i = updatedMessages.length - 1; i >= 0; i--) {
    const message = updatedMessages[i];
    if (message.type === "tool" && toolMessageNames.includes(message.name)) {
      lastToolMessageIndex = i;
      break;
    }
  }

  if (lastToolMessageIndex !== -1) {
    updatedMessages[lastToolMessageIndex] = {
      ...updatedMessages[lastToolMessageIndex],
      additional_kwargs: {
        ...updatedMessages[lastToolMessageIndex].additional_kwargs,
        result: finalResult,
      },
    };
  }

  return updatedMessages;
}

export function buildDeploymentMessages(params?: {
  instruction?: string;
  aiMessageContent?: string;
}) {
  const instruction =
    params?.instruction ||
    "The project has been successfully created and deployed. You can now explore your project by navigating to the project details, checking resource status, monitoring performance, or making further configurations. Feel free to ask me about any aspect of your project or if you need help with additional setup.";

  const aiMessageContent =
    params?.aiMessageContent ||
    "Project is successfully deployed and all resources will launch automatically, it may take some time before all public domains are accessible.";

  const successMessage = {
    id: uuidv4(),
    type: "system" as const,
    content: JSON.stringify({
      type: "universal.event",
      target: null,
      payload: {
        message: "project created successfully",
        instruction,
        createdAt: new Date().toISOString(),
      },
    }),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const aiMessage = {
    id: uuidv4(),
    type: "ai" as const,
    content: aiMessageContent,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const previewMessage = {
    id: uuidv4(),
    type: "system" as const,
    content: JSON.stringify({
      type: "universal.preview",
      target: null,
      payload: null,
    }),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return [successMessage, aiMessage, previewMessage];
}

export async function finalizeDeploymentFlow(args: {
  threadId?: string | null;
  kubeconfig?: string | null;
  projectName: string;
  messages?: any[];
  patchThreadMutate?: (payload: any) => Promise<any> | any;
  updateThreadStateMutate?: (payload: any) => Promise<any> | any;
  openProjectChat?: (name: string) => void;
  routerPush?: (path: string) => void;
  instruction?: string;
  aiMessageContent?: string;
  toolMessageNames?: string[];
}) {
  const {
    threadId,
    kubeconfig,
    projectName,
    messages,
    patchThreadMutate,
    updateThreadStateMutate,
    openProjectChat,
    routerPush,
    instruction,
    aiMessageContent,
    toolMessageNames,
  } = args;

  if (threadId && patchThreadMutate) {
    await patchThreadMutate({
      threadId,
      metadata: {
        kubeconfig,
        projectName,
        resourceTarget: null,
      },
    });
  }

  if (threadId && messages && updateThreadStateMutate) {
    const updatedMessages = updateToolMessages(messages, {
      toolMessageNames,
    });

    const extraMessages = buildDeploymentMessages({
      instruction,
      aiMessageContent,
    });

    const finalMessages = [...updatedMessages, ...extraMessages];

    await updateThreadStateMutate({
      threadId,
      values: {
        messages: finalMessages,
      },
      asNode: "entry_node",
    });
  }

  if (openProjectChat) {
    openProjectChat(projectName);
  }
  if (routerPush) {
    routerPush(`/projects/${projectName}`);
  }
}

export function computeResourceTotalsFromProposal(proposal: ProjectProposal) {
  let totalCpu = 0;
  let totalMemory = 0;
  let totalStorage = 0;
  let totalPorts = 0;

  const devboxDefaults = devboxCreateFormSchema.parse({});
  const clusterDefaults = clusterCreateFormSchema.parse({});
  const launchpadDefaults = launchpadCreateFormSchema.parse({});

  if (proposal.resources.devbox?.length) {
    proposal.resources.devbox.forEach((devbox: any) => {
      totalCpu += devboxDefaults.resource.cpu;
      totalMemory += devboxDefaults.resource.memory;
      totalPorts += devbox.ports?.length || 0;
    });
  }

  if (proposal.resources.database?.length) {
    proposal.resources.database.forEach((database: any) => {
      totalCpu += clusterDefaults.resource.cpu;
      totalMemory += clusterDefaults.resource.memory;
      totalStorage += clusterDefaults.resource.storage || 0;
    });
  }

  if (proposal.resources.app?.length) {
    proposal.resources.app.forEach((app: any) => {
      totalCpu += launchpadDefaults.resource.cpu;
      totalMemory += launchpadDefaults.resource.memory;
      totalPorts += app.ports?.length || 0;
    });
  }

  return {
    cpu: totalCpu,
    memory: totalMemory,
    storage: totalStorage,
    ports: totalPorts,
  };
}