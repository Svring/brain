"use client";

import { useEffect } from "react";
import { useLanggraphState } from "@/contexts/langgraph/langgraph-context";
import { useProjectState } from "@/contexts/project/project-context";
import { useThreads } from "@/components/provider/thread-provider";

interface UseLanggraphStateUpdateProps {
  threadId: string;
}

export function useLanggraphStateUpdate({
  threadId,
}: UseLanggraphStateUpdateProps) {
  const { apiKey, baseUrl, modelName, stage } = useLanggraphState();
  const {
    selectedProject,
    selectedResource,
    selectedProjectResources,
    selectedResourceContext,
  } = useProjectState();
  const { updateThreadState } = useThreads();

  useEffect(() => {
    if (apiKey && baseUrl && modelName && stage) {
      updateThreadState.mutate({
        threadId: threadId,
        values: {
          api_key: apiKey,
          base_url: baseUrl,
          model_name: modelName,
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
        },
        asNode: "entry_node",
      });
    }
  }, [
    threadId,
    apiKey,
    baseUrl,
    modelName,
    stage,
    selectedProject,
    selectedProjectResources,
    selectedResource,
    selectedResourceContext,
  ]);
}
