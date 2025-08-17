"use client";

import * as React from "react";
import { ProjectPlanWithStatus } from "@/contexts/langgraph/langgraph-schema";
import { ProposingStageDetail } from "./proposing-stage-detail";

export interface ProjectPlanCardProps {
  projectStatus?: "pending" | "active" | "completed";
  title?: string;
  projectData?: ProjectPlanWithStatus;
}

export function ProjectPlanCard({
  projectStatus = "pending",
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
          proposingStatus={projectStatus} 
        />
      )}
    </div>
  );
}

export default ProjectPlanCard;
