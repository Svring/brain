"use client";

import { PromptInputBox } from "./prompt-box";
import type { Message } from "@langchain/langgraph-sdk";
import { Interrupt } from "@langchain/langgraph-sdk";
import type { ToolCategoryKey } from "@/lib/langgraph/langgraph-constant/langgraph-constant-tools";
import { useProjectState } from "@/contexts/project/project-context";

interface AiChatInputProps {
  className?: string;
  exhibition?: boolean;
  onSubmit: (...args: any[]) => any;
  onStop: () => void;
  isLoading: boolean;
  interrupt?: Interrupt<unknown>;
  submit?: (
    data: { messages: Message[]; stage?: string; command?: any },
    options?: { optimisticValues?: (prev: any) => any; command?: any }
  ) => any;
  toolCategory?: ToolCategoryKey;
  disableTools?: boolean;
}

export function AiChatInput({
  className,
  exhibition = false,
  onSubmit,
  onStop,
  isLoading,
  interrupt,
  submit,
  toolCategory: propToolCategory,
  disableTools = false,
}: AiChatInputProps) {
  const { selectedResource, selectedProject } = useProjectState();

  // Determine tool category based on s·elected resource or project
  const getToolCategory = (): ToolCategoryKey | undefined => {
    // If toolCategory is explicitly provided, use it
    if (propToolCategory) {
      return propToolCategory;
    }

    // If a resource is selected, determine category based on resource type
    if (selectedResource) {
      const resourceKind = selectedResource.resourceType?.toLowerCase();
      if (resourceKind === "devbox") {
        return "manage_devbox";
      } else if (resourceKind === "cluster") {
        return "manage_cluster";
      } else if (
        resourceKind === "statefulset" ||
        resourceKind === "deployment"
      ) {
        return "manage_launchpad";
      }
    }

    // If a project is selected but no specific resource, show project management tools
    if (selectedProject) {
      return "manage_project";
    }

    // Default to deploy project tools if nothing is selected
    return "deploy_project";
  };

  const toolCategory = disableTools ? undefined : getToolCategory();
  const handleSendMessage = async (message: string) => {
    const userMessage: Message = {
      type: "human",
      content: message.trim(),
    };
    onSubmit(
      { messages: [userMessage] },
      {
        optimisticValues(prev: any) {
          const prevMessages = prev.messages ?? [];
          const newMessages = [...prevMessages, userMessage];
          return { ...prev, messages: newMessages };
        },
      }
    );
  };

  const handleStop = () => {
    // If interrupt is active, behave like Reject button
    if (interrupt?.value) {
      try {
        const parsedValue =
          typeof interrupt.value === "string"
            ? JSON.parse(interrupt.value)
            : interrupt.value;

        const responseData = {
          action: parsedValue.action,
          payload: parsedValue.payload,
          approve: false,
        };

        if (submit) {
          submit(
            { messages: [] },
            { command: { resume: JSON.stringify(responseData) } }
          );
        }
      } catch (error) {
        console.error("Failed to parse interrupt value:", error);
        onStop();
      }
    } else {
      onStop();
    }
  };

  // Check if interrupt is active
  const isInterruptActive = !!interrupt?.value;

  return (
    <PromptInputBox
      className={className}
      isLoading={isLoading}
      onSend={handleSendMessage}
      placeholder=""
      disableInput={isInterruptActive}
      disableSend={isLoading || isInterruptActive}
      onStop={handleStop}
      exhibition={exhibition}
      toolCategory={toolCategory}
    />
  );
}
