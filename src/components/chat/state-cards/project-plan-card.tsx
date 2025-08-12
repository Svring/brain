"use client";

import * as React from "react";
import {
  CopilotStepper,
  StepperStage,
} from "@/components/chat/copilot-stepper";

export interface ProjectPlanCardProps {
  analyzingStatus?: "pending" | "active" | "completed";
  proposingStatus?: "pending" | "active" | "completed";
  title?: string;
}

export function ProjectPlanCard({
  analyzingStatus = "pending",
  proposingStatus = "pending", 
  title = "Project Plan",
}: ProjectPlanCardProps) {
  const stages: StepperStage[] = [
    {
      id: "1",
      title: "Analyzing",
      description: "Analyzing project requirements and constraints",
      status: analyzingStatus,
      details: () => (
        <div className="p-4 rounded-lg">
          {/* Details component will be implemented later */}
        </div>
      ),
    },
    {
      id: "2", 
      title: "Proposing",
      description: "Creating comprehensive project plan based on analysis",
      status: proposingStatus,
      details: () => (
        <div className="p-4 rounded-lg">
          {/* Details component will be implemented later */}
        </div>
      ),
    },
  ];

  return (
    <CopilotStepper
      title={title}
      stages={stages}
    />
  );
}

export default ProjectPlanCard;
