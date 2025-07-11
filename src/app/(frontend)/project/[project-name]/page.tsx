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

import "@xyflow/react/dist/style.css";
import { useDroppable } from "@dnd-kit/core";
import { FlowProvider } from "@/contexts/flow-context";

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
        <SheetContent className="!w-[40vw] !max-w-none fade-in-0 animate-in flex flex-col">
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

function ProjectFlow({ projectName }: { projectName: string }) {
  const { data: resources } = useProjectResources(projectName);
  const [nodes, onNodesChange, edges, onEdgesChange] = useFlow(resources);

  const { setNodeRef } = useDroppable({
    id: "project-flow",
    data: {
      projectName,
    },
  });

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

  return (
    <FlowProvider>
      <DndProvider>
        <div className="relative h-screen w-full">
          <ProjectFloatingUI />
          <ProjectFlow projectName={projectName} />
        </div>
      </DndProvider>
    </FlowProvider>
  );
}
