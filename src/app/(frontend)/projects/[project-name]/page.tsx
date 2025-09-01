"use client";

import { useEffect, use } from "react";

// React Flow imports
import { Background, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Custom component imports
import AiChatbox from "@/components/chat/components/chatbox";
import AiCoin from "@/components/chat/components/coin";
import FloatingConnectionLine from "@/components/flowgraph/edge/floating-connection-line";
import { FlowgraphHeader } from "@/components/flowgraph/flowgraph-menu-header";
import { FlowgraphMenuActions } from "@/components/flowgraph/flowgraph-menu-actions";
import { FlowgraphCommandDialog } from "@/components/flowgraph/command/flowgraph-command-dialog";

// Custom hooks
import useCopilotActions from "@/hooks/copilot/use-copilot-actions";
import useFlowgraph from "@/hooks/flowgraph/use-flowgraph";
import { useManageStatusDialog } from "@/hooks/brain/use-manage-status-dialog";
import { useFlowgraphCommand } from "@/hooks/flowgraph/use-flowgraph-command";
import { useChatActions } from "@/contexts/chat/chat-context";

// Context and utilities
import {
  FlowgraphProvider,
  useFlowgraphActions,
  useFlowgraphState,
} from "@/contexts/flowgraph/flowgraph-context";
import {
  useProjectActions,
  useProjectState,
} from "@/contexts/project/project-context";
import { useDisclosure } from "@reactuses/core";

// Types and constants
import { REACT_FLOW_CONFIG } from "@/lib/flowgraph/flowgraph-constant/flowgraph-constant-config";
import edgeTypes from "@/components/flowgraph/edge/edge-types";
import nodeTypes from "@/components/flowgraph/node/node-types";
import { Spinner } from "@/components/ui/spinner";

import {
  useLanggraphActions,
  useLanggraphState,
} from "@/contexts/langgraph/langgraph-context";

// Floating UI Component
function ProjectFloatingUI({ projectName }: { projectName: string }) {
  const { clearAllState } = useFlowgraphActions();

  useEffect(() => {
    clearAllState();
  }, [projectName]);

  // Command dialog hook
  const {
    isOpen: isCommandOpen,
    onOpenChange: onCommandOpenChange,
    onOpen: onCommandOpen,
  } = useFlowgraphCommand();

  return (
    <>
      <FlowgraphHeader projectName={projectName} />
      <FlowgraphMenuActions onOpen={onCommandOpen} />
      <FlowgraphCommandDialog
        isOpen={isCommandOpen}
        onOpenChange={onCommandOpenChange}
      />
      <AiCoin />
      <AiChatbox />
    </>
  );
}

// Flow Component
function ProjectFlow({ projectName }: { projectName: string }) {
  // Use the flowgraph hook to handle all node and edge computation
  const { isLoading } = useFlowgraph(projectName);

  const { nodes, edges } = useFlowgraphState();
  const { onNodesChange, onEdgesChange } = useFlowgraphActions();

  useCopilotActions();

  // Show loading state only when initially loading resources
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Spinner variant="bars" size={24} />
      </div>
    );
  }

  return (
    <ReactFlow
      connectionLineType={REACT_FLOW_CONFIG.connectionLineType}
      edges={edges}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={REACT_FLOW_CONFIG.fitViewOptions}
      nodes={nodes}
      nodeTypes={nodeTypes}
      onEdgesChange={onEdgesChange}
      onNodesChange={onNodesChange}
      panOnScroll
      snapToGrid
      snapGrid={REACT_FLOW_CONFIG.snapGrid}
      connectionLineComponent={FloatingConnectionLine}
    >
      {/* <Background
        gap={REACT_FLOW_CONFIG.background.gap}
        size={REACT_FLOW_CONFIG.background.size}
        variant={REACT_FLOW_CONFIG.background.variant}
      /> */}
    </ReactFlow>
  );
}

// Main Page Component
export default function ProjectPage({
  params,
}: {
  params: Promise<{ "project-name": string }>;
}) {
  const { "project-name": projectName } = use(params);
  const { selectProject, clearSelectedProject, clearSelectedProjectResources } =
    useProjectActions();
  const { setStage } = useLanggraphActions();
  const { closeSidebarChat } = useChatActions();

  useEffect(() => {
    // Set the selected project when the component mounts
    selectProject(projectName);
    setStage("manage_project");

    // Clear resource data when project changes
    clearSelectedProjectResources();

    // Cleanup: clear the selected project when the component unmounts
    return () => {
      clearSelectedProject();
      // closeSidebarChat();
    };
  }, [projectName]);

  return (
    <ReactFlowProvider>
      <FlowgraphProvider>
        <div className="relative h-screen w-full">
          <ProjectFlow projectName={projectName} />

          <ProjectFloatingUI projectName={projectName} />
        </div>
      </FlowgraphProvider>
    </ReactFlowProvider>
  );
}
