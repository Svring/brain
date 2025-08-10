"use client";

import { useState, use } from "react";
import { createK8sContext } from "@/lib/auth/auth-utils";

// React Flow imports
import { Background, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Custom component imports
import { ProjectHeader } from "@/components/project/components/project-header";
import { TextShimmer } from "@/components/project/components/text-shimmer";
import AiCoin from "@/components/ai/headless/ai-coin";
import AiChatbox from "@/components/ai/headless/ai-chatbox";

// import { useFlowRefresh } from "@/hooks/flow/use-flow-refresh";
import { useProjectSignal } from "@/hooks/project/use-project-signal";

import { getBrainProjectQuery } from "@/lib/brain/brain-methods/brain-query";
import { useBrainProjectResources } from "@/hooks/brain/use-brain-project-resources";
import { useQuery } from "@tanstack/react-query";

// Custom types
import edgeTypes from "@/components/flow/edge/edge-types";
import nodeTypes from "@/components/flow/node/node-types";

// Flow context
import { FlowProvider } from "@/contexts/flow/flow-context";

// Constants
import { FLOW_CONFIG } from "@/lib/flow/flow-constant/flow-constant-config";

// Floating UI Component
function ProjectFloatingUI({ projectName }: { projectName: string }) {
  const [open, setOpen] = useState(false);
  // const { handleRefresh, isRefreshing } = useFlowRefresh(projectName);

  return (
    <>
      <ProjectHeader projectName={projectName} />
      {/* <ProjectActions
        onAddNew={() => setOpen(true)}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      /> */}
      {/* <Sheet onOpenChange={setOpen} open={open}>
        <SheetContent className="!w-[40vw] !max-w-none fade-in-0 animate-in flex flex-col">
          <SheetHeader className="flex-shrink-0">
            <SheetTitle>Add Resource</SheetTitle>
            <VisuallyHidden>
              <SheetDescription />
            </VisuallyHidden>
          </SheetHeader>
          <Droppable
            id="project-floating-ui"
            className="flex-1 min-h-0 overflow-hidden"
          >
            <AddResourceTabs />
          </Droppable>
        </SheetContent>
      </Sheet> */}
      <AiCoin />
      <AiChatbox />
    </>
  );
}

// Flow Component
function ProjectFlow({ projectName }: { projectName: string }) {
  const context = createK8sContext();

  const { expandedResources, isLoading: isLoadingResources } =
    useBrainProjectResources(projectName);

  if (isLoadingResources) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <TextShimmer className="font-mono text-md" duration={1.2}>
          Loading project resources...
        </TextShimmer>
      </div>
    );
  }

  console.log("data", expandedResources);

  return (
    <ReactFlow
      connectionLineType={FLOW_CONFIG.connectionLineType}
      // edges={edges}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={FLOW_CONFIG.fitViewOptions}
      // nodes={nodes}
      nodeTypes={nodeTypes}
      // onEdgesChange={onEdgesChange}
      // onNodesChange={onNodesChange}
      // onNodeClick={onNodeClick}
      // onNodeDragStart={handleNodeDragStart}
      // onNodeDragStop={handleNodeDragStop}
      panOnScroll
      snapToGrid
      snapGrid={FLOW_CONFIG.snapGrid}
    >
      <Background
        gap={FLOW_CONFIG.background.gap}
        size={FLOW_CONFIG.background.size}
        variant={FLOW_CONFIG.background.variant}
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

  useProjectSignal(projectName);

  return (
    <FlowProvider>
      <div className="relative h-screen w-full">
        <ReactFlowProvider>
          <ProjectFlow projectName={projectName} />
        </ReactFlowProvider>
        <ProjectFloatingUI projectName={projectName} />
      </div>
    </FlowProvider>
  );
}
