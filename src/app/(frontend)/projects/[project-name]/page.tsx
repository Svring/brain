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
import { useFlowgraphFitView } from "@/hooks/flowgraph/use-flowgraph-fitview";
import { useProjectActions } from "@/contexts/project/project-context";
import { useChatState, useChatActions } from "@/contexts/chat/chat-context";
import { useFlowgraphState } from "@/contexts/flowgraph/flowgraph-context";
import { cn } from "@/lib/utils";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { REACT_FLOW_CONFIG } from "@/lib/flowgraph/flowgraph-constant/flowgraph-constant-config";
import edgeTypes from "@/components/flowgraph/edge/edge-types";
import nodeTypes from "@/components/flowgraph/node/node-types";
import { ChatClosingProvider, useChatClosing } from "@/components/chat/chat-closing-context";
import { getProjectChatKey } from "@/contexts/chat/chat-machine";

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
          hasFocusedChat ? "right-2" : "right-2"
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
  const { focusedResourceTarget, activeResourceTargets, chatInstances } = useChatState();
  const { closeChat, closeProjectChat, openProjectChat } = useChatActions();
  const { nodes, edges } = useFlowgraphState();
  const { startClosing } = useChatClosing();

  useFlowgraphFitView();

  const handlePaneClick = () => {
    const hasFocusedChat = !!focusedResourceTarget;

    if (hasFocusedChat) {
      const chatsToClose: Array<{key: string, close: () => void}> = [];
      
      const projectChatKey = getProjectChatKey(projectName);
      if (chatInstances.has(projectChatKey)) {
        chatsToClose.push({
          key: projectChatKey,
          close: () => closeProjectChat(projectName)
        });
      }
      
      activeResourceTargets.forEach((targetKey: string) => {
        if (!targetKey.startsWith("__project__")) {
          try {
            const resourceTarget = JSON.parse(targetKey);
            chatsToClose.push({
              key: targetKey,
              close: () => closeChat(resourceTarget)
            });
          } catch (error) {
            // Failed to parse resource target
          }
        }
      });
      
      chatsToClose.forEach(({key, close}) => {
        startClosing(key, close);
      });
    } else {
      openProjectChat(projectName);
    }
  };

  const handleEdgeClick = (event: React.MouseEvent, edge: any) => {
    if (
      edge.type === "floatingError" &&
      edge.target &&
      edge.target.startsWith("network-")
    ) {
      const targetNodeId = edge.target;
      const targetNode = nodes.find((node) => node.id === targetNodeId);

      if (targetNode && targetNode.data?.target) {
        const networkAnalysisEvent = new CustomEvent("triggerNetworkAnalysis", {
          detail: {
            target: targetNode.data.target,
            nodeId: targetNodeId,
          },
        });
        window.dispatchEvent(networkAnalysisEvent);
      }
    }
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
  const hasLoadedOnceRef = useRef(false);
  const { nodes, edges } = useFlowgraphState();
  const { isLoading: rawIsLoading } = useFlowgraphNodes(resourceTargets);

  const isLoading =
    (rawIsLoading && !hasLoadedOnceRef.current) || nodes.length < 1;

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

function ProjectPageInner() {
  const params = useParams<{ "project-name": string }>();
  const projectName = params["project-name"];
  const { selectProject, clearSelectedProject, clearSelectedProjectResources } =
    useProjectActions();
  const { activeResourceTargets, focusedResourceTarget, chatInstances } = useChatState();
  const { closeChat, closeProjectChat } = useChatActions();
  const { closingChats } = useChatClosing();

  const { targets, isLoading: isLoadingResources } =
    useProjectResources(projectName);

  useEffect(() => {
    selectProject(projectName);
    clearSelectedProjectResources();

    return () => {
      clearSelectedProject();
      closeProjectChat(projectName);
      
      activeResourceTargets.forEach((targetKey) => {
        try {
          const resourceTarget = JSON.parse(targetKey);
          closeChat(resourceTarget);
        } catch (error) {
          // Failed to parse resource target
        }
      });
    };
  }, [projectName]);

  const hasCascadingChats = (() => {
    if (!focusedResourceTarget) return false;
    const focusedInstance = chatInstances.get(focusedResourceTarget);
    if (!focusedInstance) return false;
    const isResourceChat = focusedInstance.resourceTarget !== undefined;
    if (!isResourceChat) return false;
    
    const projectChatKey = getProjectChatKey(projectName);
    return chatInstances.has(projectChatKey);
  })();

  const isFocusedChatClosing = focusedResourceTarget 
    ? closingChats.has(focusedResourceTarget)
    : false;

  const activeChatsCount = Array.from(chatInstances.keys()).filter(
    key => !closingChats.has(key)
  ).length;

  const shouldKeepContainerOpen = isFocusedChatClosing && activeChatsCount >= 1;
  
  const hasFocusedChat = !!focusedResourceTarget && (!isFocusedChatClosing || shouldKeepContainerOpen);

  const chatWidth = hasCascadingChats ? "max(30%,24rem)" : "max(30%,16rem)";
  const minWidth = hasCascadingChats ? "24rem" : "16rem";

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div
        className={cn(
          "absolute inset-0 transition-all duration-900 ease-in-out"
        )}
        style={{
          right: hasFocusedChat ? chatWidth : "0",
        }}
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
          "absolute top-0 right-0 h-full transition-all duration-900 ease-in-out z-30"
        )}
        style={{
          width: chatWidth,
          minWidth: minWidth,
          transform: hasFocusedChat ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <div className="h-full p-2 pl-0 relative">
          <ChatManager />
        </div>
      </div>
    </div>
  );
}

export default function ProjectPage() {
  return (
    <ChatClosingProvider>
      <ProjectPageInner />
    </ChatClosingProvider>
  );
}