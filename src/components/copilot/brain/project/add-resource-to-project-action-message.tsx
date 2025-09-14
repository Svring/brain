"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FolderPlus } from "lucide-react";
import { ProjectProposalCard } from "@/components/chat/state-cards/project-proposal/project-proposal-card";
import { useProjectAddResource } from "@/hooks/brain/use-project-add-resource";
import { useProjectState } from "@/contexts/project/project-context";
import BaseActionMessage from "@/components/chat/messages/system-messages/components/base-action-message";
import type { ProjectResources } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

interface AddResourceToProjectActionMessageProps {
  resources: ProjectResources;
}

export function AddResourceToProjectActionMessage({
  resources,
}: AddResourceToProjectActionMessageProps) {
  const [internalResources, setInternalResources] =
    useState<ProjectResources>(resources);

  const { addResourcesToProject, isAdding } = useProjectAddResource();
  const { selectedProject } = useProjectState();
  
  console.log("resources", resources);

  // Handle adding resources to project
  const handleAddResources = async () => {
    if (!selectedProject) {
      return;
    }

    try {
      await addResourcesToProject(selectedProject, internalResources);
    } catch (error) {
      console.error("Failed to add resources to project:", error);
    }
  };

  // Create a minimal proposal object for the ProjectProposalCard
  const mockProposal = {
    name: selectedProject || "current-project",
    resources: internalResources,
  };

  // Handle proposal updates from the card
  const handleProposalUpdate = (updatedProposal: any) => {
    setInternalResources(updatedProposal.resources);
  };

  return (
    <BaseActionMessage
      headerTitle={{
        icon: FolderPlus,
        name: "Add Resources to Project",
      }}
      onApply={handleAddResources}
      isSubmitting={isAdding}
      disabled={isAdding || !selectedProject}
      applyButtonText="Add"
      className="bg-background-primary"
    >
      {!selectedProject ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <div className="text-center">
            <FolderPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No project selected. Please select a project first.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Adding resources to project: <strong>{selectedProject}</strong>
          </div>
          <ProjectProposalCard
            proposal={mockProposal}
            onProposalUpdate={handleProposalUpdate}
          />
        </div>
      )}
    </BaseActionMessage>
  );
}
