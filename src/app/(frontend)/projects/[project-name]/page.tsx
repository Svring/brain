"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import ChatManager from "@/components/chat/chat-manager";
import { FlowgraphBreadcrumb } from "@/components/flowgraph/flowgraph-breadcrumb";
import { FlowgraphCommandDialog } from "@/components/flowgraph/command/flowgraph-command-dialog";
import { FlowgraphActions } from "@/components/flowgraph/flowgraph-actions";
import FloatingConnectionLine from "@/components/flowgraph/edge/floating-connection-line";
import { FlowgraphChatLoadingHint } from "@/components/flowgraph/flowgraph-chat-loading-hint";

import { useFlowgraphCommand } from "@/hooks/flowgraph/use-flowgraph-command";
import useProjectResources from "@/hooks/brain/use-project-resources";
import { useFlowgraphNodes } from "@/hooks/flowgraph/use-flowgraph-nodes";
import { useProjectActions } from "@/contexts/project/project-context";
import { useChatState, useChatActions } from "@/contexts/chat/chat-context";
import { cn } from "@/lib/utils";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { REACT_FLOW_CONFIG } from "@/lib/flowgraph/flowgraph-constant/flowgraph-constant-config";
import edgeTypes from "@/components/flowgraph/edge/edge-types";
import nodeTypes from "@/components/flowgraph/node/node-types";

function ProjectFloatingUI({
  projectName,
  isLoading,
  nodes,
}: {
  projectName: string;
  isLoading: boolean;
  nodes: any[];
}) {
  const { isOpen, onOpenChange, onOpen, onClose } = useFlowgraphCommand();
  // const { nodes } = useFlowgraphState();

  // Don't show floating UI when loading or when nodes/edges are empty
  const shouldShowLoading = isLoading;

  if (shouldShowLoading) {
    return null;
  }

  return (
    <>
      <FlowgraphBreadcrumb projectName={projectName} />
      <div className="absolute top-2 right-2 z-20 bg-background/30 backdrop-blur-lg rounded-lg p-2">
        <FlowgraphActions onOpenCommand={onOpen} />
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
  isLoadingResources,
  isLoading,
  nodes,
  edges,
  onPaneClick,
}: {
  projectName: string;
  isLoadingResources: boolean;
  isLoading: boolean;
  nodes: any[];
  edges: any[];
  onPaneClick: () => void;
}) {
  if (isLoadingResources || isLoading) {
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
      panOnScroll
      panOnDrag
      zoomOnScroll
      zoomOnPinch
      snapToGrid
      snapGrid={REACT_FLOW_CONFIG.snapGrid}
      connectionLineComponent={FloatingConnectionLine}
      proOptions={REACT_FLOW_CONFIG.proOptions}
      onPaneClick={onPaneClick}
    />
  );
}

function ProjectFlowWithLoading({
  projectName,
  resourceTargets,
  isLoadingResources,
  onPaneClick,
}: {
  projectName: string;
  resourceTargets: any[];
  isLoadingResources: boolean;
  onPaneClick: () => void;
}) {
  const { nodes, edges, isLoading } = useFlowgraphNodes(resourceTargets);

  return (
    <>
      <ProjectFlow
        projectName={projectName}
        isLoadingResources={isLoadingResources}
        isLoading={isLoading}
        nodes={nodes}
        edges={edges}
        onPaneClick={onPaneClick}
      />
      <ProjectFloatingUI
        projectName={projectName}
        isLoading={isLoading}
        nodes={nodes}
      />
    </>
  );
}

export default function ProjectPage() {
  const params = useParams<{ "project-name": string }>();
  const projectName = params["project-name"];
  const { selectProject, clearSelectedProject, clearSelectedProjectResources } =
    useProjectActions();
  const { activeResourceTargets, focusedResourceTarget } = useChatState();
  const { closeChat, closeProjectChat, openProjectChat } = useChatActions();

  // Fetch project resources
  const { targets, isLoading: isLoadingResources } =
    useProjectResources(projectName);

  useEffect(() => {
    selectProject(projectName);
    clearSelectedProjectResources();
    return () => {
      clearSelectedProject();
      // Close all chats when exiting the project page
      closeProjectChat(projectName);
      // Close all resource chats
      activeResourceTargets.forEach((targetKey) => {
        // Parse the target key back to ResourceTarget
        const resourceTarget = JSON.parse(targetKey);
        closeChat(resourceTarget);
      });
    };
    // NOTE: To Agent: this dependency only need a projectName, do not add functions here.
  }, [projectName]);

  const hasFocusedChat = !!focusedResourceTarget;

  // Handle pane click to open/close project chat
  const handlePaneClick = () => {
    if (hasFocusedChat) {
      // If any chat is open, close it
      if (focusedResourceTarget) {
        // Check if it's a project chat key (starts with "__project__")
        if (focusedResourceTarget.startsWith("__project__")) {
          closeProjectChat(projectName);
        } else {
          // It's a resource chat, parse and close it
          const resourceTarget = JSON.parse(focusedResourceTarget);
          closeChat(resourceTarget);
        }
      }
    } else {
      // No chat is open, open project chat
      openProjectChat(projectName);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div
        className={cn(
          "absolute inset-0 transition-all duration-300 ease-in-out",
          hasFocusedChat ? "right-[35%]" : "right-0"
        )}
      >
        <ProjectFlowWithLoading
          projectName={projectName}
          resourceTargets={targets}
          isLoadingResources={isLoadingResources}
          onPaneClick={handlePaneClick}
        />
      </div>
      <div
        className={cn(
          "absolute top-0 right-0 h-full w-[35%] min-w-md transition-all duration-300 ease-in-out",
          hasFocusedChat ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="h-full p-2 pl-0">
          <ChatManager />
        </div>
      </div>
    </div>
  );
}
