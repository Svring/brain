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
import AddResourceTabs from "@/components/project/add-resource/add-resource-tabs";
import AiChatbox from "@/components/chat/ai-chatbox";
import AiCoin from "@/components/chat/ai-coin";
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
import useResourceObjects from "@/hooks/sealos/resource/use-resource-objects";
import useResourceReliances from "@/hooks/sealos/resource/use-resource-reliances";
import {
  useStartProjectResourcesMutation,
  usePauseProjectResourcesMutation,
} from "@/lib/brain/resources/project/project-method/project-mutation";

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

// Types and constants
import { REACT_FLOW_CONFIG } from "@/lib/flowgraph/flowgraph-constant/flowgraph-constant-config";
import edgeTypes from "@/components/flowgraph/edge/edge-types";
import nodeTypes from "@/components/flowgraph/node/node-types";
import { Spinner } from "@/components/ui/spinner";

import { useLanggraphActions } from "@/contexts/langgraph/langgraph-context";

// Floating UI Component
function ProjectFloatingUI({ projectName }: { projectName: string }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [sheetContent, setSheetContent] = useState<
    "add-resource" | "display-env"
  >("add-resource");

  // Create context for mutations
  const sealosContext = createSealosContext();

  // Get project resources from context
  const { selectedProjectResources } = useProjectState();

  // Initialize mutations
  const startProjectResources = useStartProjectResourcesMutation(sealosContext);

  const pauseProjectResources = usePauseProjectResourcesMutation(sealosContext);

  const handleAddNew = () => {
    setSheetContent("add-resource");
    onOpen();
  };

  const handleDisplayEnv = () => {
    setSheetContent("display-env");
    onOpen();
  };

  const handleStartAll = () => {
    if (
      !selectedProjectResources ||
      !Array.isArray(selectedProjectResources) ||
      selectedProjectResources.length === 0
    ) {
      return;
    }

    // Transform resources to ProjectResourceItem format
    const resources = transformProjectResourcesToItems(
      selectedProjectResources
    );

    startProjectResources.mutate({ resources });
  };

  const handlePauseAll = () => {
    if (
      !selectedProjectResources ||
      !Array.isArray(selectedProjectResources) ||
      selectedProjectResources.length === 0
    ) {
      return;
    }

    // Transform resources to ProjectResourceItem format
    const resources = transformProjectResourcesToItems(
      selectedProjectResources
    );

    pauseProjectResources.mutate({ resources });
  };

  // Check if mutations are in progress
  const isStarting = startProjectResources.isPending;
  const isPausing = pauseProjectResources.isPending;

  return (
    <>
      <FlowgraphHeader projectName={projectName} />
      <FlowgraphMenuActions
        onAddNew={handleAddNew}
        onDisplayEnv={handleDisplayEnv}
        onStartAll={handleStartAll}
        onPauseAll={handlePauseAll}
        isStarting={isStarting}
        isPausing={isPausing}
      />
      <Sheet onOpenChange={onOpenChange} open={isOpen}>
        <SheetContent className="w-[40vw]! max-w-none! fade-in-0 animate-in flex flex-col">
          <SheetHeader className="shrink-0">
            <SheetTitle>
              {sheetContent === "add-resource"
                ? "Add Resource"
                : "Display Environment"}
            </SheetTitle>
            <VisuallyHidden>
              <SheetDescription />
            </VisuallyHidden>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            {sheetContent === "add-resource" ? (
              <AddResourceTabs />
            ) : (
              <DisplayEnvPanel />
            )}
          </div>
        </SheetContent>
      </Sheet>
      <AiCoin />
      <AiChatbox />
    </>
  );
}

// Flow Component
function ProjectFlow({ projectName }: { projectName: string }) {
  const { resources, k8sResources, isLoading } =
    useProjectResources(projectName);
  const { resourceObjects } = useResourceObjects(resources ?? []);

  // Phase 1: Generate basic nodes from K8sResource objects immediately
  const { nodes: basicNodes } = useFlowgraphNodes(k8sResources ?? [], true);

  // Phase 2: Generate enhanced nodes with network nodes from complete objects
  const { nodes: enhancedNodes, edges: networkEdges } =
    useFlowgraphNodes(resourceObjects);

  const { reliances } = useResourceReliances(resourceObjects);
  const { edges: computedEdges } = useFlowgraphEdges(reliances);

  // console.log("resources", resources);
  // console.log("resourceObjects", resourceObjects);
  // console.log("basicNodes", basicNodes);
  // console.log("enhancedNodes", enhancedNodes);
  // console.log("reliances", reliances);
  // console.log("computedEdges", computedEdges);

  const { setNodes, setEdges } = useFlowgraphActions();
  const { nodes, edges } = useFlowgraphState();

  // Use enhanced nodes if available, otherwise fall back to basic nodes
  const currentNodes = resourceObjects.length > 0 ? enhancedNodes : basicNodes;

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

  useCopilotActions();

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
