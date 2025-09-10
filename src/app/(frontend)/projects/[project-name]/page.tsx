"use client";

import { use, useEffect } from "react";
import { Background, ReactFlow, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import AiChatbox from "@/components/chat/components/chatbox";
import { FlowgraphBreadcrumb } from "@/components/flowgraph/flowgraph-breadcrumb";
import { FlowgraphCommandHint } from "@/components/flowgraph/flowgraph-command-hint";
import { FlowgraphCommandDialog } from "@/components/flowgraph/command/flowgraph-command-dialog";
import { FlowgraphActions } from "@/components/flowgraph/flowgraph-actions";
import FloatingConnectionLine from "@/components/flowgraph/edge/floating-connection-line";

import useCopilotActions from "@/hooks/copilot/use-copilot-actions";
import useFlowgraph from "@/hooks/flowgraph/use-flowgraph";
import { useFlowgraphCommand } from "@/hooks/flowgraph/use-flowgraph-command";
import { useRelianceEdges } from "@/hooks/flowgraph/use-reliance-edges";
import { useChatActions, useChatState } from "@/contexts/chat/chat-context";
import {
  useFlowgraphActions,
  useFlowgraphState,
} from "@/contexts/flowgraph/flowgraph-context";
import { useProjectActions } from "@/contexts/project/project-context";
import { useLanggraphActions } from "@/contexts/langgraph/langgraph-context";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { REACT_FLOW_CONFIG } from "@/lib/flowgraph/flowgraph-constant/flowgraph-constant-config";
import edgeTypes from "@/components/flowgraph/edge/edge-types";
import nodeTypes from "@/components/flowgraph/node/node-types";

function ProjectFloatingUI({
  projectName,
  sidebarChatMaximized,
}: {
  projectName: string;
  sidebarChatMaximized: boolean;
}) {
  const { isOpen, onOpenChange, onOpen } = useFlowgraphCommand();

  if (sidebarChatMaximized) return null;

  return (
    <>
      <FlowgraphBreadcrumb projectName={projectName} />
      <div className="absolute top-2 right-2 z-20 bg-background/30 backdrop-blur-lg rounded-lg p-2">
        <FlowgraphActions />
      </div>
      <FlowgraphCommandHint onOpen={onOpen} />
      <FlowgraphCommandDialog isOpen={isOpen} onOpenChange={onOpenChange} />
    </>
  );
}

function ProjectFlow({
  projectName,
  sidebarChatMaximized,
}: {
  projectName: string;
  sidebarChatMaximized: boolean;
}) {
  const { isLoading } = useFlowgraph(projectName);
  useRelianceEdges();
  const { nodes, edges } = useFlowgraphState();
  const { onNodesChange, onEdgesChange } = useFlowgraphActions();
  useCopilotActions();

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
      panOnScroll={!sidebarChatMaximized}
      panOnDrag={!sidebarChatMaximized}
      zoomOnScroll={!sidebarChatMaximized}
      zoomOnPinch={!sidebarChatMaximized}
      snapToGrid
      snapGrid={REACT_FLOW_CONFIG.snapGrid}
      connectionLineComponent={FloatingConnectionLine}
      proOptions={REACT_FLOW_CONFIG.proOptions}
    />
  );
}

export default function ProjectPage({
  params,
}: {
  params: Promise<{ "project-name": string }>;
}) {
  const { "project-name": projectName } = use(params);
  const { selectProject, clearSelectedProject, clearSelectedProjectResources } =
    useProjectActions();
  const { setStage } = useLanggraphActions();
  const { sidebarChatOpen, sidebarChatMaximized } = useChatState();
  const { closeSidebarChat } = useChatActions();
  const { setMessages } = useCopilotChatHeadless_c();

  useEffect(() => {
    selectProject(projectName);
    clearSelectedProjectResources();
    setStage("manage_project");
    return () => {
      clearSelectedProject();
      setMessages([]);
      closeSidebarChat();
    };
  }, [projectName]);

  return (
    <div className="relative h-screen w-full flex overflow-hidden">
      <div
        className={cn(
          "relative h-full transition-all duration-300 ease-in-out",
          sidebarChatOpen && !sidebarChatMaximized
            ? "w-[65%]"
            : sidebarChatMaximized
            ? "w-[60%]"
            : "w-full"
        )}
      >
        <ProjectFlow
          projectName={projectName}
          sidebarChatMaximized={sidebarChatMaximized}
        />
        <ProjectFloatingUI
          projectName={projectName}
          sidebarChatMaximized={sidebarChatMaximized}
        />
      </div>
      <div
        className={cn(
          "h-full shrink-0 transition-all duration-300 ease-in-out",
          sidebarChatOpen
            ? sidebarChatMaximized
              ? "w-[40%] p-2"
              : "w-[35%] p-2 pl-0"
            : "w-0"
        )}
      >
        <AiChatbox />
      </div>
    </div>
  );
}
