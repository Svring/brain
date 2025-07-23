"use client";

import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import { ArrowLeft, Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useState, useEffect } from "react";
import { AddResourceTabs } from "@/components/project/add-resource/add-resource-tabs";
import { MenuBar } from "@/components/project/components/menu-bar";
import edgeTypes from "@/components/flow/edge/edge-types";
import nodeTypes from "@/components/flow/node/node-types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { useFlow } from "@/hooks/flow/use-flow";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DndProvider } from "@/components/flow/dnd/dnd-provider";
import { TextShimmer } from "@/components/project/components/text-shimmer";

import "@xyflow/react/dist/style.css";
import { Droppable } from "@/components/flow/dnd/droppable";
import { useRemoveProjectAnnotationMutation } from "@/lib/project/project-method/project-mutation";
import { toast } from "sonner";
import { useProjectActions } from "@/contexts/project/project-context";
import { FlowProvider } from "@/contexts/flow/flow-context";
import { useFlowFocus } from "@/hooks/flow/use-flow-focus";
import { useFlowDrop } from "@/hooks/flow/use-flow-drop";
import AiCoin from "@/components/ai/headless/ai-coin";
import AiChatbox from "@/components/ai/headless/ai-chatbox";
import DevTools from "@/components/flow/devtools/flow-devtools";

function ProjectFloatingUI({ projectName }: { projectName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const removeProjectAnnotationMutation = useRemoveProjectAnnotationMutation();
  const { setFlowGraphData } = useProjectActions();

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await removeProjectAnnotationMutation.mutateAsync({ projectName });
      setFlowGraphData(projectName, null);
      toast.success("Project resources refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh project resources");
    } finally {
      setIsRefreshing(false);
    }
  };

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
        >
          <span className="mx-2">{projectName}</span>
        </MenuBar>
      </div>
      {/* MenuBar in the upper right corner */}
      <div className="absolute top-2 right-2 z-20">
        <MenuBar
          activeIndex={null}
          items={[
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

      <AiCoin />
      <AiChatbox />
    </>
  );
}

function ProjectFlow({ projectName }: { projectName: string }) {
  const [nodes, onNodesChange, edges, onEdgesChange, isLoading] =
    useFlow(projectName);
  const { handleDrop } = useFlowDrop(projectName);

  // Auto-focus on selected nodes
  useFlowFocus();

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
        {/* <DevTools /> */}
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
  const { enterProject, exitProject } = useProjectActions();

  // Set project name in machine context on mount
  useEffect(() => {
    enterProject();
    return () => {
      exitProject();
    };
  }, [projectName]);

  return (
    <DndProvider>
      <FlowProvider>
        <div className="relative h-screen w-full">
          <ProjectFloatingUI projectName={projectName} />
          <ReactFlowProvider>
            <ProjectFlow projectName={projectName} />
          </ReactFlowProvider>
        </div>
      </FlowProvider>
    </DndProvider>
  );
}
