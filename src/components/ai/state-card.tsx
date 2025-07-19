"use client";

import type { AiState } from "@/contexts/ai-context/ai-machine";

interface StateCardProps {
  state: AiState;
}

export function StateCard({ state }: StateCardProps) {
  return (
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
        {state.project_context?.homepageData?.projects
          ? JSON.stringify(state.project_context.homepageData.projects)
          : "(none)"}
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
  );
}