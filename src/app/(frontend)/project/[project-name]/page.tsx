"use client";

import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ReactFlow,
} from "@xyflow/react";
import { ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import dynamic from "next/dynamic";
import { AddResourceTabs } from "@/components/app/project/add-resource/add-resource-tabs";
import { MenuBar } from "@/components/app/project/menu-bar";
import edgeTypes from "@/components/flow/edge/edge-types";
import nodeTypes from "@/components/flow/node/node-types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useProjectResources } from "@/hooks/app/project/use-project-resources";
import { useFlow } from "@/hooks/flow/use-flow";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ProjectContext } from "@/contexts/project-context";
import { DndProvider } from "@/components/flow/dnd/dnd-provider";
import { TextShimmer } from "@/components/app/project/text-shimmer";
import useAI from "@/hooks/ai/use-ai";
import { CopilotButton } from "@/components/ai/copilot-button";
import { CopilotWindow } from "@/components/ai/copilot-window";
import { CopilotHeader } from "@/components/ai/copilot-header";
import { CopilotInput } from "@/components/ai/copilot-input";
import { CopilotMessages } from "@/components/ai/copilot-messages";

import "@xyflow/react/dist/style.css";
import { useDroppable } from "@dnd-kit/core";
import { FlowProvider } from "@/contexts/flow-context";

const CopilotSidebar = dynamic(() =>
  import("@copilotkit/react-ui").then((mod) => mod.CopilotSidebar)
);

function ProjectFloatingUI() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { setNodeRef } = useDroppable({
    id: "project-floating-ui",
  });

  return (
    <>
      {/* MenuBar in the upper left corner */}
      <div className="absolute top-2 left-2 z-20">
        <MenuBar
          activeIndex={null}
          items={[
            {
              icon: ArrowLeft,
              label: "Back to Home",
              onClick: () => router.push("/"),
              isToggle: false,
            },
          ]}
        />
      </div>
      {/* MenuBar in the upper right corner */}
      <div className="absolute top-2 right-2 z-20">
        <MenuBar
          activeIndex={null}
          items={[
            {
              icon: Plus,
              label: "Add New",
              onClick: () => setOpen(true),
              isToggle: false,
            },
          ]}
        />
      </div>
      <Sheet onOpenChange={setOpen} open={open}>
        <SheetContent
          onClose={() => setOpen(false)}
          className="!w-[40vw] !max-w-none fade-in-0 animate-in flex flex-col"
        >
          <SheetHeader className="flex-shrink-0">
            <SheetTitle>Add Resource</SheetTitle>
            <VisuallyHidden>
              <SheetDescription></SheetDescription>
            </VisuallyHidden>
          </SheetHeader>
          <div ref={setNodeRef} className="flex-1 min-h-0 overflow-hidden">
            <AddResourceTabs />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function ProjectFlow() {
  const { projectName: currentProjectName } = use(ProjectContext);

  const { data: resources, isLoading } = useProjectResources(
    currentProjectName ?? ""
  );
  const [nodes, onNodesChange, edges, onEdgesChange] = useFlow(resources);

  const { setNodeRef } = useDroppable({
    id: "project-flow",
    data: {
      projectName: currentProjectName,
    },
  });

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
    <ReactFlow
      ref={setNodeRef}
      connectionLineType={ConnectionLineType.SmoothStep}
      edges={edges}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={{
        padding: 0.1,
        includeHiddenNodes: false,
        minZoom: 0.1,
        maxZoom: 1.0,
      }}
      nodes={nodes}
      nodeTypes={nodeTypes}
      onEdgesChange={onEdgesChange}
      onNodesChange={onNodesChange}
      panOnScroll
      snapToGrid
      snapGrid={[20, 20]}
    >
      <Background gap={60} size={1} variant={BackgroundVariant.Dots} />
    </ReactFlow>
  );
}

export default function Page({
  params,
}: {
  params: Promise<{ "project-name": string }>;
}) {
  const { "project-name": projectName } = use(params);
  const { setProjectName } = use(ProjectContext);
  setProjectName(projectName);

  useAI();

  return (
    <FlowProvider>
      <DndProvider>
        <div className="relative h-screen w-full">
          <ProjectFloatingUI />
          <ProjectFlow />
          <CopilotSidebar
            Button={CopilotButton}
            Window={CopilotWindow}
            Header={CopilotHeader}
            Input={CopilotInput}
            Messages={CopilotMessages}
          />
        </div>
      </DndProvider>
    </FlowProvider>
  );
}
