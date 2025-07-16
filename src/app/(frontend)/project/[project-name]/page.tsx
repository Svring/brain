"use client";

import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ReactFlow,
} from "@xyflow/react";
import { ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useState, useEffect } from "react";
import { AddResourceTabs } from "@/components/app/project/add-resource/add-resource-tabs";
import { MenuBar } from "@/components/app/project/components/menu-bar";
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
import { DndProvider } from "@/components/flow/dnd/dnd-provider";
import { TextShimmer } from "@/components/app/project/components/text-shimmer";
import { CopilotSidebarWrapper } from "@/components/ai/copilot-sidebar-wrapper";

import "@xyflow/react/dist/style.css";
import { Droppable } from "@/components/flow/dnd/droppable";
import { useProjectContext } from "@/contexts/project-context/project-context";

function ProjectFloatingUI() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

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
          <Droppable
            id="project-floating-ui"
            className="flex-1 min-h-0 overflow-hidden"
          >
            <AddResourceTabs />
          </Droppable>
        </SheetContent>
      </Sheet>
    </>
  );
}

function ProjectFlow({ projectName }: { projectName: string }) {
  const { data: resources, isLoading } = useProjectResources(projectName);

  const [nodes, onNodesChange, edges, onEdgesChange] = useFlow(resources);

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
      }}
    >
      <ReactFlow
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
    </Droppable>
  );
}

export default function Page({
  params,
}: {
  params: Promise<{ "project-name": string }>;
}) {
  const { "project-name": projectName } = use(params);
  const { send } = useProjectContext();

  // Set project name in machine context on mount
  useEffect(() => {
    send({ type: "ENTER_PROJECT" });
    return () => {
      send({ type: "EXIT_PROJECT" });
    };
  }, [projectName, send]);

  return (
    <DndProvider>
      <div className="relative h-screen w-full">
        <ProjectFloatingUI />
        <ProjectFlow projectName={projectName} />
        <CopilotSidebarWrapper />
      </div>
    </DndProvider>
  );
}
