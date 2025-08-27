"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProjectProposalDisplay } from "./display";
import { ProjectProposalEdit } from "./edit";
import type { ProjectProposal } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

interface ProjectProposalCardProps {
  proposal: ProjectProposal;
  className?: string;
  initialMode?: "display" | "edit";
}

export function ProjectProposalCard({
  proposal,
  className = "",
  initialMode = "display",
}: ProjectProposalCardProps) {
  const [mode, setMode] = useState<"display" | "edit">(initialMode);

  const handleEdit = () => {
    setMode("edit");
  };

  const handleSave = (updatedProposal: ProjectProposal) => {
    // Here you could handle saving the updated proposal
    console.log("Saving updated proposal:", updatedProposal);
    setMode("display");
  };

  const handleCancel = () => {
    setMode("display");
  };

  if (mode === "edit") {
    return (
      <ProjectProposalEdit
        proposal={proposal}
        onSave={handleSave}
        onCancel={handleCancel}
        className={className}
      />
    );
  }

  return (
    <div className={className}>
      <ProjectProposalDisplay
        proposal={proposal}
        className={className}
      />
      <div className="flex justify-center mt-6">
        <Button onClick={handleEdit} size="lg">
          Edit Proposal
        </Button>
      </div>
    </div>
  );
}

// Re-export individual components for direct use
export { ProjectProposalDisplay } from "./display";
export { ProjectProposalEdit } from "./edit";

// Export types for use in other components
export type {
  ProjectProposal,
  DevBox,
  Database,
  ObjectStorageBucket,
  App,
  Reliances,
} from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
