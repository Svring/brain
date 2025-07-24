"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { createK8sContext } from "@/lib/auth/auth-utils";

// React Flow imports
import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Icon imports
import { ArrowLeft, Plus, RefreshCw } from "lucide-react";

// Custom component imports
import { MenuBar } from "@/components/project/components/menu-bar";
import { AddResourceTabs } from "@/components/project/add-resource/add-resource-tabs";
import { Droppable } from "@/components/flow/dnd/droppable";
import { DndProvider } from "@/components/flow/dnd/dnd-provider";
import { TextShimmer } from "@/components/project/components/text-shimmer";
import AiCoin from "@/components/ai/headless/ai-coin";
import AiChatbox from "@/components/ai/headless/ai-chatbox";

// UI component imports
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

// Custom hook imports
import { useFlow } from "@/hooks/flow/use-flow";
import { useFlowFocus } from "@/hooks/flow/use-flow-focus";
import { useFlowDrop } from "@/hooks/flow/use-flow-drop";
import { useFlowRefresh } from "@/hooks/flow/use-flow-refresh";
import { useProjectSignal } from "@/hooks/project/use-project-signal";

// Custom types
import edgeTypes from "@/components/flow/edge/edge-types";
import nodeTypes from "@/components/flow/node/node-types";

// Flow context
import { FlowProvider } from "@/contexts/flow/flow-context";

// Constants
const FLOW_CONFIG = {
  connectionLineType: ConnectionLineType.SmoothStep,
  snapGrid: [20, 20] as [number, number],
  fitViewOptions: {
    padding: 0.1,
    includeHiddenNodes: false,
    minZoom: 0.1,
    maxZoom: 1.0,
  },
  background: {
    gap: 60,
    size: 1,
    variant: BackgroundVariant.Dots,
  },
};

interface ProjectPageProps {
  params: Promise<{ "project-name": string }>;
}

// Floating UI Component
function ProjectFloatingUI({ projectName }: { projectName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { handleRefresh, isRefreshing } = useFlowRefresh(projectName);

  const menuItemsLeft = [
    {
      icon: ArrowLeft,
      label: "Back to Home",
      onClick: () => router.push("/"),
      isToggle: false,
    },
  ];

  const menuItemsRight = [
    {
      icon: isRefreshing
        ? () => <RefreshCw className="animate-spin" />
        : RefreshCw,
      label: "Refresh",
      onClick: handleRefresh,
      isToggle: false,
    },
    {
      icon: Plus,
      label: "Add New",
      onClick: () => setOpen(true),
      isToggle: false,
    },
  ];

  return (
    <>
      <div className="absolute top-2 left-2 z-20">
        <MenuBar activeIndex={null} items={menuItemsLeft}>
          <span className="mx-2">{projectName}</span>
        </MenuBar>
      </div>
      <div className="absolute top-2 right-2 z-20">
        <MenuBar activeIndex={null} items={menuItemsRight} />
      </div>
      <Sheet onOpenChange={setOpen} open={open}>
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
      </Sheet>
      <AiCoin />
      <AiChatbox />
    </>
  );
}

// Flow Component
function ProjectFlow({ projectName }: { projectName: string }) {
  const context = createK8sContext();
  const [nodes, onNodesChange, edges, onEdgesChange, isLoading] = useFlow(
    context,
    projectName
  );
  const { handleDrop } = useFlowDrop(context, projectName);
  const { onNodeClick } = useFlowFocus();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <TextShimmer className="font-mono text-md" duration={1.2}>
          Loading project resources...
        </TextShimmer>
      </div>
    );
  }

  return (
    <Droppable
      id="project-flow"
      className="w-full h-full"
      data={{
        projectName: projectName ?? "",
        onDrop: handleDrop,
      }}
    >
      <ReactFlow
        connectionLineType={FLOW_CONFIG.connectionLineType}
        edges={edges}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={FLOW_CONFIG.fitViewOptions}
        nodes={nodes}
        nodeTypes={nodeTypes}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
        onNodeClick={onNodeClick}
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
    </Droppable>
  );
}

// Main Page Component
export default function ProjectPage({ params }: ProjectPageProps) {
  const { "project-name": projectName } = use(params);

  useProjectSignal(projectName);

  return (
    <DndProvider>
      <FlowProvider>
        <div className="relative h-screen w-full">
          <ReactFlowProvider>
            <ProjectFlow projectName={projectName} />
          </ReactFlowProvider>
          <ProjectFloatingUI projectName={projectName} />
        </div>
      </FlowProvider>
    </DndProvider>
  );
}
