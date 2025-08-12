"use client";

import { useState, use, useEffect } from "react";
import { createK8sContext } from "@/lib/auth/auth-utils";

// React Flow imports
import { Background, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Shadcn UI imports
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

// Custom component imports
import { FlowgraphHeader } from "@/components/flowgraph/flowgraph-menu-header";
import { FlowgraphMenuActions } from "@/components/flowgraph/flowgraph-menu-actions";
import { TextShimmer } from "@/components/ui/text-shimmer";
import AiCoin from "@/components/chat/ai-coin";
import AiChatbox from "@/components/chat/ai-chatbox";

import { useProjectResources } from "@/hooks/brain/use-project-resources";
import useResourceObjects from "@/hooks/sealos/use-resource-objects";
import useFlowgraphNodes from "@/hooks/flowgraph/use-flowgraph-nodes";
import useResourceReliances from "@/hooks/sealos/use-resource-reliances";
import useFlowgraphEdges from "@/hooks/flowgraph/use-flowgraph-edges";
import { convertPortsToIngressNodes } from "@/lib/flowgraph/nodes/flowgraph-nodes-utils";
import useCopilotActions from "@/hooks/copilot/use-copilot-actions";

// Custom types
import edgeTypes from "@/components/flowgraph/edge/edge-types";
import nodeTypes from "@/components/flowgraph/node/node-types";

// Flow context
import { FlowgraphProvider } from "@/contexts/flowgraph/flowgraph-context";
import {
  useFlowgraphActions,
  useFlowgraphState,
} from "@/contexts/flowgraph/flowgraph-context";

// Constants
import { REACT_FLOW_CONFIG } from "@/lib/flowgraph/flowgraph-constant/flowgraph-constant-config";

// Floating UI Component
function ProjectFloatingUI({ projectName }: { projectName: string }) {
  const [open, setOpen] = useState(false);
  // const { handleRefresh, isRefreshing } = useFlowRefresh(projectName);

  return (
    <>
      <FlowgraphHeader projectName={projectName} />
      <FlowgraphMenuActions onAddNew={() => setOpen(true)} />
      <Sheet onOpenChange={setOpen} open={open}>
        <SheetContent className="w-[40vw]! max-w-none! fade-in-0 animate-in flex flex-col">
          <SheetHeader className="shrink-0">
            <SheetTitle>Add Resource</SheetTitle>
            <VisuallyHidden>
              <SheetDescription />
            </VisuallyHidden>
          </SheetHeader>
          {/* <Droppable
            id="project-floating-ui"
            className="flex-1 min-h-0 overflow-hidden"
          ></Droppable> */}
        </SheetContent>
      </Sheet>
      <AiCoin />
      <AiChatbox />
    </>
  );
}

// Flow Component
function ProjectFlow({ projectName }: { projectName: string }) {
  const { resources, isLoading, error } = useProjectResources(projectName);
  const { resourceObjects } = useResourceObjects(resources ?? []);
  const { nodes: computedNodes } = useFlowgraphNodes(resourceObjects);
  const { reliances } = useResourceReliances(resourceObjects);
  const { edges: computedEdges } = useFlowgraphEdges(reliances);

  const { setNodes, setEdges, onNodesChange, onEdgesChange } =
    useFlowgraphActions();
  const { nodes, edges } = useFlowgraphState();

  useEffect(() => {
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

    // Set nodes and edges with ingress nodes included
    setNodes(allNodes);
    setEdges(allEdges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computedNodes, computedEdges]);

  // Show loading state if nodes and edges are not ready
  if (!nodes.length || !edges.length) {
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
      onEdgesChange={onEdgesChange}
      onNodesChange={onNodesChange}
      panOnScroll
      snapToGrid
      snapGrid={REACT_FLOW_CONFIG.snapGrid}
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

  useCopilotActions();

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
