"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useParams } from "next/navigation";
import { ReactFlow, useNodesState, useEdgesState, NodeChange, EdgeChange, Node, Edge } from "@xyflow/react";
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
import { useFlowgraphState, useFlowgraphActions } from "@/contexts/flowgraph/flowgraph-context";
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
  savePositions,
}: {
  projectName: string;
  isLoadingResources: boolean;
  isLoading: boolean;
  savePositions: (nodes: any[]) => void;
}) {
  const { focusedResourceTarget } = useChatState();
  const { closeChat, closeProjectChat, openProjectChat } = useChatActions();

  const { nodes: contextNodes, edges: contextEdges } = useFlowgraphState();
  const { updateNodePosition, startDragging, stopDragging } = useFlowgraphActions();
  
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedRef = useRef(false);
  const isDraggingRef = useRef(false);
  
  useEffect(() => {
    if (!isDraggingRef.current && contextNodes.length > 0) {
      if (!hasInitializedRef.current || nodes.length !== contextNodes.length) {
        setNodes(contextNodes);
        hasInitializedRef.current = true;
      }
    }
  }, [contextNodes.length]);
  
  useEffect(() => {
    setEdges(contextEdges);
  }, [contextEdges, setEdges]);
  
  useFlowgraphFitView();

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      
      for (const change of changes) {
        if (change.type === 'position') {
          if (change.dragging === true) {
            if (!isDraggingRef.current) {
              isDraggingRef.current = true;
              setIsDragging(true);
              startDragging();
            }
          } else if (change.dragging === false && isDraggingRef.current) {
            isDraggingRef.current = false;
            setIsDragging(false);
            stopDragging();
            
            if (saveTimerRef.current) {
              clearTimeout(saveTimerRef.current);
            }
            
            saveTimerRef.current = setTimeout(() => {
              setNodes((currentNodes) => {
                requestAnimationFrame(() => {
                  currentNodes.forEach((node) => {
                    updateNodePosition(node.id, node.position);
                  });
                  savePositions(currentNodes);
                });
                return currentNodes;
              });
            }, 1500);
          }
        }
      }
    },
    [onNodesChange, startDragging, stopDragging, updateNodePosition, savePositions, setNodes]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
    },
    [onEdgesChange]
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const handlePaneClick = () => {
    const hasFocusedChat = !!focusedResourceTarget;

    if (hasFocusedChat) {
      if (focusedResourceTarget) {
        if (focusedResourceTarget.startsWith("__project__")) {
          closeProjectChat(projectName);
        } else {
          const resourceTarget = JSON.parse(focusedResourceTarget);
          closeChat(resourceTarget);
        }
      }
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
      nodesDraggable={true}
      nodesConnectable={false}
      elementsSelectable={false}
      onNodesChange={handleNodesChange}
      onEdgesChange={handleEdgesChange}
      panOnScroll
      panOnDrag={true}
      zoomOnScroll
      zoomOnPinch
      snapToGrid
      snapGrid={REACT_FLOW_CONFIG.snapGrid}
      connectionLineComponent={FloatingConnectionLine}
      proOptions={REACT_FLOW_CONFIG.proOptions}
      onPaneClick={handlePaneClick}
      onEdgeClick={handleEdgeClick}
      deleteKeyCode={null}
      multiSelectionKeyCode={null}
      minZoom={0.2}
      maxZoom={2}
      elevateNodesOnSelect={false}
      selectNodesOnDrag={false}
      attributionPosition="bottom-left"
      preventScrolling={false}
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
  const { nodes } = useFlowgraphState();
  const { isLoading: rawIsLoading, savePositions } = useFlowgraphNodes(resourceTargets);

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
        savePositions={savePositions}
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

  const { targets, isLoading: isLoadingResources } =
    useProjectResources(projectName);

  useEffect(() => {
    selectProject(projectName);
    clearSelectedProjectResources();

    if (focusedResourceTarget) {
      if (focusedResourceTarget.startsWith("__project__")) {
        const currentProjectChatKey = `__project__${projectName}`;
        if (focusedResourceTarget !== currentProjectChatKey) {
          closeProjectChat(projectName);
        } else {
          openProjectChat(projectName);
          
          const triggerThreadSelectionEvent = new CustomEvent("triggerProjectThreadSelection", {
            detail: {
              projectName,
            },
          });
          
          window.dispatchEvent(triggerThreadSelectionEvent);
        }
      } else {
        const resourceTarget = JSON.parse(focusedResourceTarget);
        closeChat(resourceTarget);
      }
    }

    return () => {
      clearSelectedProject();
      closeProjectChat(projectName);
      activeResourceTargets.forEach((targetKey) => {
        const resourceTarget = JSON.parse(targetKey);
        closeChat(resourceTarget);
      });
    };
  }, [projectName]);

  const hasFocusedChat = !!focusedResourceTarget;

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div
        className={cn(
          "absolute inset-0 transition-all duration-300 ease-in-out",
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