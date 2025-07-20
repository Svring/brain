"use client";

import { StateCard } from "../../state-card";
import { useAiContext } from "@/contexts/ai-context/ai-context";
import { MessageRendererProps } from "./types";

export function RenderAgentStateMessage({ message }: MessageRendererProps) {
  const { state } = useAiContext();

  return (
    <div className="max-w-[95%] mr-auto">
      <StateCard state={state.context.state} className="max-w-md" />
    </div>
  );
}