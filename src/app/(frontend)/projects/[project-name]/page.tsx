"use client";

import { useState, use } from "react";
import { createK8sContext } from "@/lib/auth/auth-utils";

// React Flow imports
import { Background, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Custom component imports
import { ProjectHeader } from "@/components/project/project-header";
import { TextShimmer } from "@/components/ui/text-shimmer";
import AiCoin from "@/components/chat/ai-coin";
import AiChatbox from "@/components/chat/ai-chatbox";

import { getProjectQuery } from "@/lib/brain/resources/project/project-method/project-query";
import { useProjectResources } from "@/hooks/brain/use-project-resources";
import { useQuery } from "@tanstack/react-query";

// Custom types
import edgeTypes from "@/components/flowgraph/edge/edge-types";
import nodeTypes from "@/components/flowgraph/node/node-types";

// Flow context
import { FlowgraphProvider } from "@/contexts/flowgraph/flowgraph-context";

// Constants
import { REACT_FLOW_CONFIG } from "@/lib/flowgraph/flowgraph-constant/flowgraph-constant-config";

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
        <SheetContent className="w-[40vw]! max-w-none! fade-in-0 animate-in flex flex-col">
          <SheetHeader className="shrink-0">
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

  // const { expandedResources, isLoading: isLoadingResources } =
  //   useBrainProjectResources(projectName);

  // if (isLoadingResources) {
  //   return (
  //     <div className="flex items-center justify-center h-full w-full">
  //       <TextShimmer className="font-mono text-md" duration={1.2}>
  //         Loading project resources...
  //       </TextShimmer>
  //     </div>
  //   );
  // }

  // console.log("data", expandedResources);

  return (
    <ReactFlow
      connectionLineType={REACT_FLOW_CONFIG.connectionLineType}
      // edges={edges}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={REACT_FLOW_CONFIG.fitViewOptions}
      // nodes={nodes}
      nodeTypes={nodeTypes}
      // onEdgesChange={onEdgesChange}
      // onNodesChange={onNodesChange}
      // onNodeClick={onNodeClick}
      // onNodeDragStart={handleNodeDragStart}
      // onNodeDragStop={handleNodeDragStop}
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
