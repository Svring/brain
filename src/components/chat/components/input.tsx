"use client";

import { PromptInputBox } from "./prompt-box";
import { useLanggraphState } from "@/contexts/langgraph/langgraph-context";
import { useProjectState } from "@/contexts/project/project-context";
import type { BrainState } from "@/contexts/langgraph/langgraph-schema";

interface AiChatInputProps {
  className?: string;
  exhibition?: boolean;
  submit: (
    data: {
      messages: Array<{ type: "human"; content: string }>;
    } & Omit<BrainState, "messages">
  ) => void;
  stop: () => void;
  isLoading: boolean;
}

export function AiChatInput({
  className,
  exhibition = false,
  submit,
  stop,
  isLoading,
}: AiChatInputProps) {
  const { apiKey, baseUrl, modelName, stage, contextWindowUsage } =
    useLanggraphState();
  const {
    selectedProject,
    selectedResource,
    selectedProjectResources,
    selectedResourceContext,
  } = useProjectState();

  const handleSendMessage = (message: string) => {
    if (
      message.trim() &&
      !isLoading &&
      apiKey &&
      baseUrl &&
      modelName &&
      stage
    ) {
      submit({
        messages: [{ type: "human", content: message.trim() }],
        api_key: apiKey,
        base_url: baseUrl,
        model_name: modelName,
        context_window_usage: contextWindowUsage,
        stage: stage,
        project_context: {
          selectedProject,
          selectedProjectResources,
        },
        resource_context: selectedResource
          ? {
              selectedResource,
              selectedResourceContext,
            }
          : undefined,
      });
    }
  };

  const handleStop = () => {
    stop();
  };

  return (
    <PromptInputBox
      className={className}
      isLoading={isLoading}
      onSend={handleSendMessage}
      placeholder=""
      disableInput={false}
      disableSend={isLoading}
      onStop={handleStop}
      exhibition={exhibition}
    />
  );
}
