"use client";

import { useEffect } from "react";
import { useLanggraphState } from "@/contexts/langgraph/langgraph-context";
import { useProjectState } from "@/contexts/project/project-context";
import { useUpdateThreadStateMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";

interface UseLanggraphStateUpdateProps {
  threadId: string;
}

export function useLanggraphStateUpdate({ threadId }: UseLanggraphStateUpdateProps) {
  const { apiKey, baseUrl, modelName, stage } = useLanggraphState();
  const {
    selectedProject,
    selectedResource,
    selectedProjectResources,
    selectedResourceContext,
  } = useProjectState();
  const { mutate: updateThreadState } = useUpdateThreadStateMutation();

  useEffect(() => {
    if (apiKey && baseUrl && modelName && stage) {
      updateThreadState({
        threadId: threadId,
        state: {
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
          as_node: "entry_node",
        },
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
    updateThreadState,
  ]);
}
