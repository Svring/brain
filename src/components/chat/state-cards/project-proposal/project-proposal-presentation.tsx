"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Grid, List, FolderPlus, Workflow } from "lucide-react";
import { ProjectProposalCard } from "./project-proposal-card";
import { ProjectProposalPreview } from "./project-proposal-preview";
import { useProjectCreate } from "@/hooks/brain/use-project-create";
import BaseActionMessage from "@/components/chat/messages/system-messages/components/base-action-message";
import type { ProjectProposal } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
import { useChatActions } from "@/contexts/chat/chat-context";

interface ProjectProposalPresentationProps {
  proposal: ProjectProposal;
}

export function ProjectProposalPresentation({
  proposal,
}: ProjectProposalPresentationProps) {
  const [viewMode, setViewMode] = useState<"list" | "graph">("list");
  const [internalProposal, setInternalProposal] =
    useState<ProjectProposal>(proposal);

  const { createProject, isCreating } = useProjectCreate();

  const { openSidebarChat } = useChatActions();

  // Handle project creation
  const handleCreate = async () => {
    await createProject(internalProposal);
  };

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
        name: "Create",
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
        <div className="space-y-4">
          <h4 className="text-md font-medium">Project Architecture Preview</h4>
          <ProjectProposalPreview
            proposal={internalProposal}
            className="border rounded-lg"
          />
        </div>
      )} */}
    </BaseActionMessage>
  );
}
