"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Grid,
  List,
  FolderPlus,
  Workflow,
  CircleCheckBigIcon,
} from "lucide-react";
import { ProjectProposalCard } from "@/components/chat/state-cards/project-proposal/project-proposal-card";
import { ProjectProposalPreview } from "@/components/chat/state-cards/project-proposal/project-proposal-preview";
import { useProjectCreate } from "@/hooks/brain/use-project-create";
import BaseActionMessage from "@/components/chat/messages/system-messages/components/base-action-message";
import type { ProjectProposal } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
import { useChatActions } from "@/contexts/chat/chat-context";

// Component that handles the success message and system message appending
const ProjectCreationSuccessMessage = ({ args }: { args: any }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center p-2 border rounded-lg">
        <div className="flex items-center gap-2">
          <CircleCheckBigIcon className="h-4 w-4 text-green-600" />
          <p className="text-sm">Project created successfully</p>
        </div>
      </div>
    </div>
  );
};

interface ProjectProposalActionMessageProps {
  args: {
    project_proposal: ProjectProposal;
  };
  respond?: (message: string) => void;
  result?: any;
  onSuccess?: (data: any) => void;
}

export function ProjectProposalActionMessage({
  args,
  respond,
  result,
  onSuccess,
}: ProjectProposalActionMessageProps) {
  const [viewMode, setViewMode] = useState<"list" | "graph">("list");
  const [internalProposal, setInternalProposal] = useState<ProjectProposal>(
    args.project_proposal
  );

  const { createProject, isCreating } = useProjectCreate();
  const { openSidebarChat } = useChatActions();

  // Handle project creation
  const handleCreate = async () => {
    try {
      openSidebarChat();
      const result = await createProject(internalProposal);
      respond?.(`Project "${internalProposal.name}" created successfully`);
      onSuccess?.(result);
    } catch (error) {
      console.error("Failed to create project:", error);
      respond?.("Failed to create project");
    }
  };

  // Show completion message when result is provided (tool result display)
  if (result) {
    return <ProjectCreationSuccessMessage args={args.project_proposal} />;
  }

  // const viewToggleButtons = (
  //   <div className="flex items-center gap-2">
  //     <Button
  //       variant={viewMode === "list" ? "default" : "outline"}
  //       size="sm"
  //       onClick={() => setViewMode("list")}
  //       className="flex items-center gap-2"
  //     >
  //       <List className="h-4 w-4" />
  //       Resources
  //     </Button>
  //     <Button
  //       variant={viewMode === "graph" ? "default" : "outline"}
  //       size="sm"
  //       onClick={() => setViewMode("graph")}
  //       className="flex items-center gap-2"
  //     >
  //       <Workflow className="h-4 w-4" />
  //       Preview
  //     </Button>
  //   </div>
  // );

  return (
    <BaseActionMessage
      headerTitle={{
        icon: FolderPlus,
        name: "Create Project",
      }}
      // headerSlot={viewToggleButtons}
      onApply={handleCreate}
      isSubmitting={isCreating}
      disabled={isCreating}
      applyButtonText="Create"
      className="bg-background-primary"
    >
      {/* Content based on view mode */}
      {/* {viewMode === "list" ? ( */}
      <ProjectProposalCard
        proposal={internalProposal}
        onProposalUpdate={setInternalProposal}
      />
      {/* ) : (
        <ProjectProposalPreview
          proposal={internalProposal}
          className="border rounded-lg"
        />
      )} */}
    </BaseActionMessage>
  );
}
