"use client";

import { use, useEffect } from "react";
import { Background, ReactFlow, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import AiChatbox from "@/components/chat/components/chatbox";
import { FlowgraphBreadcrumb } from "@/components/flowgraph/flowgraph-breadcrumb";
import { FlowgraphCommandHint } from "@/components/flowgraph/flowgraph-command-hint";
import { FlowgraphFocusHint } from "@/components/flowgraph/flowgraph-focus-hint";
import { FlowgraphChatLoadingHint } from "@/components/flowgraph/flowgraph-chat-loading-hint";
import { FlowgraphCommandDialog } from "@/components/flowgraph/command/flowgraph-command-dialog";
import { FlowgraphActions } from "@/components/flowgraph/flowgraph-actions";
import FloatingConnectionLine from "@/components/flowgraph/edge/floating-connection-line";

import useCopilotActions from "@/hooks/copilot/use-copilot-actions";
import useFlowgraph from "@/hooks/flowgraph/use-flowgraph";
import { useFlowgraphCommand } from "@/hooks/flowgraph/use-flowgraph-command";
import { useChatActions, useChatState } from "@/contexts/chat/chat-context";
import {
  useFlowgraphActions,
  useFlowgraphState,
} from "@/contexts/flowgraph/flowgraph-context";
import { useProjectActions } from "@/contexts/project/project-context";
import { useLanggraphActions } from "@/contexts/langgraph/langgraph-context";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { cn } from "@/lib/utils";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { REACT_FLOW_CONFIG } from "@/lib/flowgraph/flowgraph-constant/flowgraph-constant-config";
import edgeTypes from "@/components/flowgraph/edge/edge-types";
import nodeTypes from "@/components/flowgraph/node/node-types";
import useProjectResources from "@/hooks/brain/use-project-resources";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

function ProjectFloatingUI({
  projectName,
  sidebarChatMaximized,
  isLoading,
}: {
  projectName: string;
  sidebarChatMaximized: boolean;
  isLoading: boolean;
}) {
  const { isOpen, onOpenChange, onOpen } = useFlowgraphCommand();
  const { nodes, edges } = useFlowgraphState();

  // Don't show floating UI when loading or when nodes/edges are empty
  const shouldShowLoading = isLoading || nodes.length === 0;

  if (shouldShowLoading) {
    return null;
  }

  if (sidebarChatMaximized) {
    return (
      <>
        <FlowgraphFocusHint projectName={projectName} />
        <FlowgraphChatLoadingHint />
      </>
    );
  }

  return (
    <>
      <FlowgraphBreadcrumb projectName={projectName} />
      <div className="absolute top-2 right-2 z-20 bg-background/30 backdrop-blur-lg rounded-lg p-2">
        <FlowgraphActions onOpenCommand={onOpen} />
      </div>
      <FlowgraphCommandDialog isOpen={isOpen} onOpenChange={onOpenChange} />
      <FlowgraphChatLoadingHint />
    </>
  );
}

function ProjectFlow({
  projectName,
  sidebarChatMaximized,
  resourceTargets,
  isLoadingResources,
}: {
  projectName: string;
  sidebarChatMaximized: boolean;
  resourceTargets: any[];
  isLoadingResources: boolean;
}) {
  const { isLoading } = useFlowgraph(
    projectName,
    resourceTargets,
    isLoadingResources
  );
  const { nodes, edges } = useFlowgraphState();
  const { onNodesChange, onEdgesChange } = useFlowgraphActions();
  // useCopilotActions();

  // console.log("isLoading", isLoading);
  // console.log("nodes", nodes);
  // console.log("edges", edges);

  // Show loading if either isLoading is true OR if nodes or edges length equals 0
  const shouldShowLoading = isLoading || nodes.length === 0;

  if (shouldShowLoading) {
    return (
      <LoadingScreen
        text="Loading..."
        variant="bars"
        size={24}
        className="h-full w-full"
      />
    );
  }

  return (
    <ReactFlow
      key={projectName}
      connectionLineType={REACT_FLOW_CONFIG.connectionLineType}
      edges={edges}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={REACT_FLOW_CONFIG.fitViewOptions}
      nodes={nodes}
      nodeTypes={nodeTypes}
      onEdgesChange={onEdgesChange}
      onNodesChange={onNodesChange}
      panOnScroll={!sidebarChatMaximized}
      panOnDrag={!sidebarChatMaximized}
      zoomOnScroll={!sidebarChatMaximized}
      zoomOnPinch={!sidebarChatMaximized}
      snapToGrid
      snapGrid={REACT_FLOW_CONFIG.snapGrid}
      connectionLineComponent={FloatingConnectionLine}
      proOptions={REACT_FLOW_CONFIG.proOptions}
      onEdgeClick={(event, edge) => {
        console.log("edge clicked", edge);
      }}
    />
  );
}

function ProjectFlowWithLoading({
  projectName,
  sidebarChatMaximized,
  resourceTargets,
  isLoadingResources,
}: {
  projectName: string;
  sidebarChatMaximized: boolean;
  resourceTargets: any[];
  isLoadingResources: boolean;
}) {
  const { isLoading } = useFlowgraph(
    projectName,
    resourceTargets,
    isLoadingResources
  );
  const { nodes, edges } = useFlowgraphState();

  // Use the same loading logic as ProjectFlow
  const shouldShowLoading = isLoading || nodes.length === 0;

  return (
    <>
      <ProjectFlow
        projectName={projectName}
        sidebarChatMaximized={sidebarChatMaximized}
        resourceTargets={resourceTargets}
        isLoadingResources={isLoadingResources}
      />
      <ProjectFloatingUI
        projectName={projectName}
        sidebarChatMaximized={sidebarChatMaximized}
        isLoading={shouldShowLoading}
      />
    </>
  );
}

export default function ProjectPage({
  params,
}: {
  params: Promise<{ "project-name": string }>;
}) {
  const { "project-name": projectName } = use(params);
  const { selectProject, clearSelectedProject, clearSelectedProjectResources } =
    useProjectActions();
  const { setStage } = useLanggraphActions();
  const { sidebarChatOpen, sidebarChatMaximized } = useChatState();
  const { closeSidebarChat } = useChatActions();
  const { setMessages } = useCopilotChatHeadless_c();
  const { refresh } = useFlowgraphActions();

  // Fetch project resources and compose resource targets
  const { resources, isLoading: isLoadingResources } =
    useProjectResources(projectName);

  // Create resource targets for fetching complete data
  const resourceTargets = (resources ?? [])
    .map((resource: any) => ({
      target: convertResourceObjectToTarget({
        kind: resource.kind || "",
        name: resource.metadata?.name || "",
      }),
      kind: resource.kind || "",
      name: resource.metadata?.name || "",
    }))
    .filter((r: any) => r.kind && r.name);

  useEffect(() => {
    selectProject(projectName);
    clearSelectedProjectResources();
    // setStage("manage_project");
    // Trigger refresh to force re-fetching of flowgraph data
    refresh();
    return () => {
      clearSelectedProject();
      setMessages([]);
      closeSidebarChat();
    };
  }, [projectName]);

  // Show loading screen while resources are being fetched
  if (isLoadingResources) {
    return (
      <LoadingScreen
        text="Loading project resources..."
        variant="bars"
        size={24}
        className="h-screen w-full"
      />
    );
  }

  return (
    <div className="relative h-screen w-full flex overflow-hidden">
      <div
        className={cn(
          "relative h-full transition-all duration-300 ease-in-out",
          sidebarChatOpen && !sidebarChatMaximized
            ? "w-[65%]"
            : sidebarChatMaximized
            ? "w-[60%]"
            : "w-full"
        )}
      >
        <ProjectFlowWithLoading
          projectName={projectName}
          sidebarChatMaximized={sidebarChatMaximized}
          resourceTargets={resourceTargets}
          isLoadingResources={isLoadingResources}
        />
      </div>
      <div
        className={cn(
          "h-full shrink-0 transition-all duration-300 ease-in-out",
          sidebarChatOpen
            ? sidebarChatMaximized
              ? "w-[40%] p-2"
              : "w-[35%] p-2 pl-0"
            : "w-0"
        )}
      >
        <AiChatbox />
      </div>
    </div>
  );
}
