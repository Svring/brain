"use client";

import { useEffect, useMemo, useState, use } from "react";

// React Flow imports
import { Background, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Shadcn UI imports
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

// Custom component imports
import AiChatbox from "@/components/chat/components/chatbox";
import AiCoin from "@/components/chat/components/coin";
import DisplayEnvPanel from "@/components/project/display-env/display-env-panel";
import FloatingConnectionLine from "@/components/flowgraph/edge/floating-connection-line";
import { FlowgraphHeader } from "@/components/flowgraph/flowgraph-menu-header";
import { FlowgraphMenuActions } from "@/components/flowgraph/flowgraph-menu-actions";
import { TextShimmer } from "@/components/ui/text-shimmer";

// Custom hooks
import useCopilotActions from "@/hooks/copilot/use-copilot-actions";
import useFlowgraphEdges from "@/hooks/flowgraph/use-flowgraph-edges";
import useFlowgraphNodes from "@/hooks/flowgraph/use-flowgraph-nodes";
import useProjectResources from "@/hooks/brain/use-project-resources";
import useResourceReliances from "@/hooks/sealos/resource/use-resource-reliances";
import { useManageStatusDialog } from "@/hooks/brain/use-manage-status-dialog";

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
import { createSealosContext } from "@/lib/auth/auth-utils";
import { transformProjectResourcesToItems } from "@/lib/brain/resources/project/project-method/project-utils";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

// Types and constants
import { REACT_FLOW_CONFIG } from "@/lib/flowgraph/flowgraph-constant/flowgraph-constant-config";
import edgeTypes from "@/components/flowgraph/edge/edge-types";
import nodeTypes from "@/components/flowgraph/node/node-types";
import { Spinner } from "@/components/ui/spinner";

import { useLanggraphActions, useLanggraphState } from "@/contexts/langgraph/langgraph-context";
import { useAppendMessagesMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";

// Floating UI Component
function ProjectFloatingUI({ projectName }: { projectName: string }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Create context for mutations
  const sealosContext = createSealosContext();

  // Add resource message mutation
  const { mutate: appendMessages } = useAppendMessagesMutation();

  // Get project resources from context
  const { selectedProjectResources } = useProjectState();

  // Manage status dialog hook
  const { openDialog: openManageStatusDialog, ManageStatusDialogComponent } = useManageStatusDialog();

  const handleAddNew = () => {
    appendMessages([
      {
        role: "system",
        content: {
          type: "universal.addResource",
          payload: {},
        },
      },
    ]);
  };

  const handleDisplayEnv = () => {
    onOpen();
  };

  const handleManageStatus = () => {
    openManageStatusDialog();
  };

  // Check if resources are available
  const hasResources =
    selectedProjectResources &&
    Array.isArray(selectedProjectResources) &&
    selectedProjectResources.length > 0;

  return (
    <>
      <FlowgraphHeader projectName={projectName} />
      <FlowgraphMenuActions
        onAddNew={handleAddNew}
        onDisplayEnv={handleDisplayEnv}
        onManageStatus={handleManageStatus}
        disabled={!hasResources}
      />
      <Sheet onOpenChange={onOpenChange} open={isOpen}>
        <SheetContent className="w-[40vw]! max-w-none! fade-in-0 animate-in flex flex-col">
          <SheetHeader className="shrink-0">
            <SheetTitle>Display Environment</SheetTitle>
            <VisuallyHidden>
              <SheetDescription />
            </VisuallyHidden>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            <DisplayEnvPanel />
          </div>
        </SheetContent>
      </Sheet>
      <ManageStatusDialogComponent />
      <AiCoin />
      <AiChatbox />
    </>
  );
}

// Flow Component
function ProjectFlow({ projectName }: { projectName: string }) {
  const { resources, k8sResources, isLoading } =
    useProjectResources(projectName);

  // Get project resources from project state
  const { selectedProjectResources } = useProjectState();
  const { clearSelectedProjectResources } = useProjectActions();

  // Clear resource data when project changes
  useEffect(() => {
    clearSelectedProjectResources();
  }, [projectName]);

  // Phase 1: Generate basic nodes from K8sResource objects immediately
  const { nodes: basicNodes } = useFlowgraphNodes(k8sResources ?? [], true);

  // Phase 2: Generate enhanced nodes with network nodes from complete objects
  const { nodes: enhancedNodes, edges: networkEdges } = useFlowgraphNodes(
    selectedProjectResources ?? []
  );

  const { reliances } = useResourceReliances(selectedProjectResources ?? []);
  const { edges: computedEdges } = useFlowgraphEdges(reliances);

  // console.log("resources", resources);
  // console.log("selectedProjectResources", selectedProjectResources);
  // console.log("basicNodes", basicNodes);
  // console.log("enhancedNodes", enhancedNodes);
  // console.log("reliances", reliances);
  // console.log("computedEdges", computedEdges);

  const { setNodes, setEdges } = useFlowgraphActions();
  const { nodes, edges } = useFlowgraphState();

  // Merge basic nodes with enhanced nodes (enhanced nodes replace basic nodes when available)
  const currentNodes = useMemo(() => {
    if (selectedProjectResources?.length === 0) {
      return basicNodes;
    }

    // Create a map of enhanced nodes by their IDs
    const enhancedNodeMap = new Map(
      enhancedNodes.map((node) => [node.id, node])
    );

    // Start with basic nodes and replace with enhanced versions when available
    const mergedNodes = basicNodes.map((basicNode) => {
      const enhancedNode = enhancedNodeMap.get(basicNode.id);
      return enhancedNode || basicNode;
    });

    // Add any enhanced nodes that don't have basic counterparts (e.g., network nodes)
    const basicNodeIds = new Set(basicNodes.map((node) => node.id));
    const additionalEnhancedNodes = enhancedNodes.filter(
      (node) => !basicNodeIds.has(node.id)
    );

    const result = [...mergedNodes, ...additionalEnhancedNodes];
    // console.log("currentNodes result:", result);
    return result;
  }, [basicNodes, enhancedNodes, selectedProjectResources?.length]);

  // Combine network edges (from ports) with computed edges (from reliances)
  const finalEdges = useMemo(() => {
    return [...networkEdges, ...computedEdges];
  }, [networkEdges, computedEdges]);

  useEffect(() => {
    // Set nodes and edges (network nodes are now included when objects are ready)
    setNodes(currentNodes);
    setEdges(finalEdges);
  }, [currentNodes, finalEdges]);

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
      // onEdgesChange={onEdgesChange}
      // onNodesChange={onNodesChange}
      panOnScroll
      snapToGrid
      snapGrid={REACT_FLOW_CONFIG.snapGrid}
      connectionLineComponent={FloatingConnectionLine}
    >
      <Background
        gap={REACT_FLOW_CONFIG.background.gap}
        size={REACT_FLOW_CONFIG.background.size}
        variant={REACT_FLOW_CONFIG.background.variant}
      />
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
  const { selectProject, clearSelectedProject } = useProjectActions();
  const { setStage } = useLanggraphActions();

  useEffect(() => {
    // Set the selected project when the component mounts
    selectProject(projectName);
    setStage("manage_project");

    // Cleanup: clear the selected project when the component unmounts
    return () => {
      clearSelectedProject();
    };
  }, [projectName]);

  return (
    <FlowgraphProvider>
      <div className="relative h-screen w-full">
        <ReactFlowProvider>
          <ProjectFlow projectName={projectName} />
        </ReactFlowProvider>
        <ProjectFloatingUI projectName={projectName} />
      </div>
    </FlowgraphProvider>
  );
}
