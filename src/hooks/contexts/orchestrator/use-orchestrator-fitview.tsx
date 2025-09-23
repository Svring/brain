import { useEffect } from "react";
import { useChatState } from "@/contexts/chat/chat-context";
import { useFlowgraphState } from "@/contexts/flowgraph/flowgraph-context";
import { useReactFlow } from "@xyflow/react";

export const useOrchestratorFitView = () => {
  const { sidebarChatMaximized } = useChatState();
  const { selectedNode } = useFlowgraphState();
  const { fitView } = useReactFlow();

  // Handle fitView when chat is maximized and there's a selected node
  useEffect(() => {
    if (sidebarChatMaximized && selectedNode) {
      // Small delay to ensure the layout has updated
      const timer = setTimeout(() => {
        fitView({
          nodes: [{ id: selectedNode }],
          padding: 0.2,
          duration: 300,
          maxZoom: 1,
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [sidebarChatMaximized, selectedNode]);

  // Handle fitView when chat is minimized
  useEffect(() => {
    if (!sidebarChatMaximized) {
      // Small delay to ensure the layout has updated
      const timer = setTimeout(() => {
        fitView({
          padding: 0.2,
          duration: 300,
          maxZoom: 1,
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [sidebarChatMaximized]);
};
