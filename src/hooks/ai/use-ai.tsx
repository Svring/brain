"use client";

import { useCoAgent, useCoAgentStateRender } from "@copilotkit/react-core";
import { use } from "react";
import type { AIState } from "@/components/app/base/provider/ai-provider";
import { AuthContext } from "@/contexts/auth-context/auth-context";

export default function useAI() {
  const { user } = use(AuthContext);

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
          <strong>Active Project:</strong>{" "}
          {state.project_context.activeProject ?? "(none)"}
        </div>
        <div>
          <strong>Projects:</strong>{" "}
          {state.project_context.projects.join(", ") || "(none)"}
        </div>
        <div>
          <strong>Active Node:</strong>{" "}
          {state.project_context.activeNode
            ? JSON.stringify(state.project_context.activeNode)
            : "(none)"}
        </div>
      </div>
    ),
  });

  return useCoAgent<AIState>({
    name: "ai",
    initialState: {
      base_url: user?.baseUrl,
      api_key: user?.apiKey,
      model: "gpt-4o-mini",
      system_prompt: "you are sealos brain.",
    },
  });
}
