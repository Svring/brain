"use client";

import * as React from "react";
import { ProjectProposal } from "@/contexts/langgraph/langgraph-schema";
import { ProposingStageDetail } from "./proposing-stage-detail";

export interface ProjectPlanCardProps {
  title?: string;
  projectData?: ProjectProposal;
}

export function ProjectPlanCard({
  title = "Project Plan",
  projectData,
}: ProjectPlanCardProps) {
  return (
    <div className="h-full flex flex-col border border-dashed rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      {projectData && (
        <ProposingStageDetail 
          proposingData={projectData} 
        />
      )}
    </div>
  );
}

export default ProjectPlanCard;
