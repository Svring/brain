"use client";

import { useEffect, useRef } from "react";
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
import { useFlowgraphState } from "@/contexts/flowgraph/flowgraph-context";
import { cn } from "@/lib/utils";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { REACT_FLOW_CONFIG } from "@/lib/flowgraph/flowgraph-constant/flowgraph-constant-config";
import edgeTypes from "@/components/flowgraph/edge/edge-types";
import nodeTypes from "@/components/flowgraph/node/node-types";

function ProjectFloatingUI({
  projectName,
  isLoading,
  nodes,
  hasFocusedChat,
}: {
  projectName: string;
  isLoading: boolean;
  nodes: any[];
  hasFocusedChat: boolean;
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
      <FlowgraphBreadcrumb
        projectName={projectName}
        hasFocusedChat={hasFocusedChat}
      />
      <div
        className={cn(
          "absolute top-2 z-40 bg-background/30 backdrop-blur-lg rounded-lg p-2 transition-all duration-300 ease-in-out",
          hasFocusedChat
            ? "right-2" // Stay 2 units from the right edge of the flow container (which is already pushed left)
            : "right-2"
        )}
      >
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
}: {
  projectName: string;
  isLoadingResources: boolean;
  isLoading: boolean;
}) {
  const { focusedResourceTarget } = useChatState();
  const { closeChat, closeProjectChat, openProjectChat } = useChatActions();
  const { nodes, edges } = useFlowgraphState();

  // Handle pane click to open/close project chat
  const handlePaneClick = () => {
    const hasFocusedChat = !!focusedResourceTarget;
    
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

  // Handle edge click (placeholder for now)
  const handleEdgeClick = () => {
    // Add edge click logic here if needed
    console.log("Edge clicked");
  };

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
      onPaneClick={handlePaneClick}
      onEdgeClick={handleEdgeClick}
    />
  );
}

function ProjectFlowWithLoading({
  projectName,
  resourceTargets,
  isLoadingResources,
  hasFocusedChat,
}: {
  projectName: string;
  resourceTargets: any[];
  isLoadingResources: boolean;
  hasFocusedChat: boolean;
}) {
  // Ref to prevent isLoading from being set to true again after first false
  const hasLoadedOnceRef = useRef(false);

  // Get nodes and edges from flowgraph context
  const { nodes, edges } = useFlowgraphState();
  
  // Still use the hook for loading state and to trigger computation
  const { isLoading: rawIsLoading } = useFlowgraphNodes(resourceTargets);

  // Only show loading if it hasn't loaded once before
  const isLoading = rawIsLoading && !hasLoadedOnceRef.current;

  // Track when loading completes for the first time
  useEffect(() => {
    if (!rawIsLoading && !hasLoadedOnceRef.current) {
      hasLoadedOnceRef.current = true;
    }
  }, [rawIsLoading]);

  return (
    <>
      <ProjectFlow
        projectName={projectName}
        isLoadingResources={isLoadingResources}
        isLoading={isLoading}
      />
      <ProjectFloatingUI
        projectName={projectName}
        isLoading={isLoading}
        nodes={nodes}
        hasFocusedChat={hasFocusedChat}
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

    // Clear any focused chat when entering a new project
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

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div
        className={cn(
          "absolute inset-0 transition-all duration-300 ease-in-out",
          // Use max(35%, 28rem) so when the screen is narrow, we still reserve at least 28rem for chat
          hasFocusedChat ? "right-[max(35%,28rem)]" : "right-0"
        )}
      >
        <ProjectFlowWithLoading
          projectName={projectName}
          resourceTargets={targets}
          isLoadingResources={isLoadingResources}
          hasFocusedChat={hasFocusedChat}
        />
      </div>
      <div
        className={cn(
          // Match width with the reserved right inset above. 28rem equals Tailwind's md (min-w-md ~ 28rem)
          "absolute top-0 right-0 h-full w-[max(35%,28rem)] min-w-[28rem] transition-all duration-300 ease-in-out z-30",
          hasFocusedChat ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="h-full p-2 pl-0 relative">
          <ChatManager />
        </div>
      </div>
    </div>
  );
}
