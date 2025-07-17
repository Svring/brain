"use client";

import { useCoAgent, useCoAgentStateRender } from "@copilotkit/react-core";
import type { AIState } from "@/components/app/base/provider/ai-provider";
import { useAuthContext } from "@/contexts/auth-context/auth-context";

export default function useAI() {
  const { auth } = useAuthContext();

  useCoAgentStateRender<AIState>({
    name: "ai",
    render: ({ state }) => (
      <div style={{ fontSize: 12, fontFamily: "monospace", padding: 8 }}>
        <div>
          <strong>Model:</strong> {state.model}
        </div>
        <div>
          <strong>System Prompt:</strong> {state.system_prompt}
        </div>
        <div>
          <strong>Base URL:</strong> {state.base_url}
        </div>
        <div>
          <strong>API Key:</strong> {state.api_key ? "****" : "(none)"}
        </div>
        <div>
          <strong>Projects:</strong>{" "}
          {state.project_context?.homepageData?.projects?.join(", ") ||
            "(none)"}
        </div>
        <div>
          <strong>Project:</strong>{" "}
          {state.project_context?.flowGraphData?.project ?? "(none)"}
        </div>
        <div>
          <strong>Resources:</strong>{" "}
          {state.project_context?.flowGraphData?.resources
            ? JSON.stringify(state.project_context.flowGraphData.resources)
            : "(none)"}
        </div>
      </div>
    ),
  });

  return useCoAgent<AIState>({
    name: "ai",
    initialState: {
      base_url: auth?.baseUrl,
      api_key: auth?.apiKey,
      model: "gpt-4o-mini",
      system_prompt: "you are sealos brain.",
      project_context: {
        projects: [],
        activeProject: null,
        activeNode: null,
      },
    },
  });
}
