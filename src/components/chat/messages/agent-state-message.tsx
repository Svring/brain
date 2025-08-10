"use client";

import { StateCard } from "../ai-state-card";
import { useAiState } from "@/contexts/ai/ai-context";
import { MessageRendererProps } from "./types";

export function RenderAgentStateMessage({ message }: MessageRendererProps) {
  const { aiState } = useAiState();

  return (
    <div className="max-w-full mr-auto">
      <StateCard state={aiState} className="max-w-md" />
    </div>
  );
}
