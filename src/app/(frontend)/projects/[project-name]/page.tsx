"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Background, ReactFlow, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import AiChatbox from "@/components/chat/components/chatbox";
import { FlowgraphBreadcrumb } from "@/components/flowgraph/flowgraph-breadcrumb";
import { FlowgraphCommandHint } from "@/components/flowgraph/flowgraph-command-hint";
import { FlowgraphFocusHint } from "@/components/flowgraph/flowgraph-focus-hint";
import { FlowgraphChatLoadingHint } from "@/components/flowgraph/flowgraph-chat-loading-hint";
import { FlowgraphCommandDialog } from "@/components/flowgraph/command/flowgraph-command-dialog";
import { FlowgraphActions } from "@/components/flowgraph/flowgraph-actions";
import FloatingConnectionLine from "@/components/flowgraph/edge/floating-connection-line";

// import useCopilotActions from "@/hooks/copilot/use-copilot-actions";
import { useFlowgraphCommand } from "@/hooks/flowgraph/use-flowgraph-command";
import { useChatActions, useChatState } from "@/contexts/chat/chat-context";
import { useThreads } from "@/components/provider/thread-provider";
// import {
//   useFlowgraphActions,
//   useFlowgraphState,
// } from "@/contexts/flowgraph/flowgraph-context";
import { useProjectActions } from "@/contexts/project/project-context";
import { useLanggraphActions } from "@/contexts/langgraph/langgraph-context";
import { cn } from "@/lib/utils";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { REACT_FLOW_CONFIG } from "@/lib/flowgraph/flowgraph-constant/flowgraph-constant-config";
import edgeTypes from "@/components/flowgraph/edge/edge-types";
import nodeTypes from "@/components/flowgraph/node/node-types";
// import useFlowgraph from "@/hooks/flowgraph/use-flowgraph";
import useProjectResources from "@/hooks/brain/use-project-resources";
import { useProjectRefresh } from "@/hooks/brain/use-project-refresh";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useFlowgraphNodes } from "@/hooks/flowgraph/use-flowgraph-nodes";

function ProjectFloatingUI({
  projectName,
  sidebarChatMaximized,
  isLoading,
  onRefresh,
  nodes,
}: {
  projectName: string;
  sidebarChatMaximized: boolean;
  isLoading: boolean;
  onRefresh: () => void;
  nodes: any[];
}) {
  const { isOpen, onOpenChange, onOpen, onClose } = useFlowgraphCommand();
  // const { nodes } = useFlowgraphState();

  // Don't show floating UI when loading or when nodes/edges are empty
  const shouldShowLoading = isLoading;

  if (shouldShowLoading) {
    return null;
  }

  if (sidebarChatMaximized) {
    return (
      <>
        <FlowgraphFocusHint projectName={projectName} />
        <FlowgraphChatLoadingHint />
      </>
    );
  }

  return (
    <>
      <FlowgraphBreadcrumb projectName={projectName} />
      <div className="absolute top-2 right-2 z-20 bg-background/30 backdrop-blur-lg rounded-lg p-2">
        <FlowgraphActions onOpenCommand={onOpen} onRefresh={onRefresh} />
      </div>
      <FlowgraphCommandDialog
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={onClose}
      />
      <FlowgraphChatLoadingHint />
    </>
  );
}

function ProjectFlow({
  projectName,
  sidebarChatMaximized,
  resourceTargets,
  isLoadingResources,
  isLoading,
  nodes,
  edges,
}: // onNodesChange,
// onEdgesChange,
{
  projectName: string;
  sidebarChatMaximized: boolean;
  resourceTargets: any[];
  isLoadingResources: boolean;
  isLoading: boolean;
  nodes: any[];
  edges: any[];
  // onNodesChange: (changes: any) => void;
  // onEdgesChange: (changes: any) => void;
}) {
  // const { nodes, edges } = useFlowgraphState();
  // const { onNodesChange, onEdgesChange } = useFlowgraphActions();
  // useCopilotActions();

  // Show loading if either isLoading is true OR if nodes or edges length equals 0
  const shouldShowLoading = isLoading;

  if (shouldShowLoading) {
    return (
      <LoadingScreen
        text="Loading..."
        variant="bars"
        size={24}
        className="h-full w-full"
      />
    );
  }

  return (
    <ReactFlow
      key={projectName}
      connectionLineType={REACT_FLOW_CONFIG.connectionLineType}
      edges={edges}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={REACT_FLOW_CONFIG.fitViewOptions}
      nodes={nodes}
      nodeTypes={nodeTypes}
      // onEdgesChange={onEdgesChange}
      // onNodesChange={onNodesChange}
      panOnScroll={!sidebarChatMaximized}
      panOnDrag={!sidebarChatMaximized}
      zoomOnScroll={!sidebarChatMaximized}
      zoomOnPinch={!sidebarChatMaximized}
      snapToGrid
      snapGrid={REACT_FLOW_CONFIG.snapGrid}
      connectionLineComponent={FloatingConnectionLine}
      proOptions={REACT_FLOW_CONFIG.proOptions}
      onEdgeClick={(event, edge) => {
        console.log("edge clicked", edge);
      }}
    />
  );
}

function ProjectFlowWithLoading({
  projectName,
  sidebarChatMaximized,
  resourceTargets,
  isLoadingResources,
  onRefresh,
}: {
  projectName: string;
  sidebarChatMaximized: boolean;
  resourceTargets: any[];
  isLoadingResources: boolean;
  onRefresh: () => void;
}) {
  // console.log("resourceTargets", resourceTargets);
  // const { isLoading } = useFlowgraph(resourceTargets, isLoadingResources);
  // const { nodes } = useFlowgraphState();
  const {
    nodes: flowgraphNodes,
    edges: flowgraphEdges,
    isLoading: isLoadingFlowgraphNodes,
  } = useFlowgraphNodes(resourceTargets);

  const shouldShowLoading = isLoadingFlowgraphNodes;

  return (
    <>
      <ProjectFlow
        projectName={projectName}
        sidebarChatMaximized={sidebarChatMaximized}
        resourceTargets={resourceTargets}
        isLoadingResources={isLoadingResources}
        isLoading={isLoadingFlowgraphNodes}
        nodes={flowgraphNodes}
        edges={flowgraphEdges}
        // onNodesChange={onNodesChange}
        // onEdgesChange={onEdgesChange}
      />
      <ProjectFloatingUI
        projectName={projectName}
        sidebarChatMaximized={sidebarChatMaximized}
        isLoading={shouldShowLoading}
        onRefresh={onRefresh}
        nodes={flowgraphNodes}
      />
    </>
  );
}

export default function ProjectPage() {
  const params = useParams<{ "project-name": string }>();
  const projectName = params["project-name"];
  const { selectProject, clearSelectedProject, clearSelectedProjectResources } =
    useProjectActions();
  const { sidebarChatOpen, sidebarChatMaximized } = useChatState();
  const { closeSidebarChat } = useChatActions();
  const { refreshProject } = useProjectRefresh(projectName);

  // Fetch project resources
  const { targets, isLoading: isLoadingResources } =
    useProjectResources(projectName);

  useEffect(() => {
    selectProject(projectName);
    clearSelectedProjectResources();
    // refresh();
    return () => {
      clearSelectedProject();
      closeSidebarChat();
    };
  }, [projectName]);

  // Show loading screen while resources are being fetched
  if (isLoadingResources) {
    return (
      <LoadingScreen
        text="Loading project resources..."
        variant="bars"
        size={24}
        className="h-screen w-full"
      />
    );
  }

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
        <ProjectFlowWithLoading
          projectName={projectName}
          sidebarChatMaximized={sidebarChatMaximized}
          resourceTargets={targets}
          isLoadingResources={isLoadingResources}
          onRefresh={refreshProject}
        />
      </div>
      <div
        className={cn(
          "h-full shrink-0 transition-all duration-300 ease-in-out",
          sidebarChatOpen
            ? sidebarChatMaximized
              ? "w-[40%] p-2 min-w-md"
              : "w-[35%] p-2 pl-0 min-w-md"
            : "w-0"
        )}
      >
        <AiChatbox />
      </div>
    </div>
  );
}
