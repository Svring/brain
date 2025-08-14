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
import useResourceObjects from "@/hooks/sealos/use-resource-objects";
import useResourceReliances from "@/hooks/sealos/use-resource-reliances";

// Context and utilities
import { convertPortsToIngressNodes } from "@/lib/flowgraph/nodes/flowgraph-nodes-utils";
import {
  FlowgraphProvider,
  useFlowgraphActions,
  useFlowgraphState,
} from "@/contexts/flowgraph/flowgraph-context";
import { useProjectActions } from "@/contexts/project/project-context";
import { useDisclosure } from "@reactuses/core";

// Types and constants
import { REACT_FLOW_CONFIG } from "@/lib/flowgraph/flowgraph-constant/flowgraph-constant-config";
import edgeTypes from "@/components/flowgraph/edge/edge-types";
import nodeTypes from "@/components/flowgraph/node/node-types";

// Floating UI Component
function ProjectFloatingUI({ projectName }: { projectName: string }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [sheetContent, setSheetContent] = useState<
    "add-resource" | "display-env"
  >("add-resource");

  const handleAddNew = () => {
    setSheetContent("add-resource");
    onOpen();
  };

  const handleDisplayEnv = () => {
    setSheetContent("display-env");
    onOpen();
  };

  return (
    <>
      <FlowgraphHeader projectName={projectName} />
      <FlowgraphMenuActions
        onAddNew={handleAddNew}
        onDisplayEnv={handleDisplayEnv}
      />
      <Sheet onOpenChange={onClose} open={isOpen}>
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
  const { resources, isLoading } = useProjectResources(projectName);
  const { resourceObjects } = useResourceObjects(resources ?? []);
  const { nodes: computedNodes } = useFlowgraphNodes(resourceObjects);
  const { reliances } = useResourceReliances(resourceObjects);
  const { edges: computedEdges } = useFlowgraphEdges(reliances);

  const { setNodes, setEdges, onNodesChange, onEdgesChange } =
    useFlowgraphActions();
  const { nodes, edges } = useFlowgraphState();

  // Memoize ingress node processing to avoid heavy computation on every render
  const { finalNodes, finalEdges } = useMemo(() => {
    // Generate ingress nodes and edges from ports of all resource nodes
    let allNodes = [...computedNodes];
    let allEdges = [...computedEdges];

    // Process each computed node to extract ports and generate ingress nodes
    for (const node of computedNodes) {
      const { data } = node;
      if (data && data.ports) {
        const { newNodes, newEdges } = convertPortsToIngressNodes(
          data.ports,
          data.name,
          data.kind,
          data,
          allNodes,
          allEdges
        );
        allNodes = [...allNodes, ...newNodes];
        allEdges = [...allEdges, ...newEdges];
      }
    }

    return {
      finalNodes: allNodes,
      finalEdges: allEdges,
    };
  }, [computedNodes, computedEdges]);

  useEffect(() => {
    // Set nodes and edges with ingress nodes included
    setNodes(finalNodes);
    setEdges(finalEdges);
  }, [finalNodes, finalEdges]);

  // Show loading state only when resources exist but nodes haven't been computed yet
  if (isLoading || (resources.length > 0 && !nodes.length)) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <TextShimmer className="font-mono text-md" duration={1.2}>
          Loading flowgraph...
        </TextShimmer>
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

  useCopilotActions();

  useEffect(() => {
    // Set the selected project when the component mounts
    selectProject(projectName);

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
