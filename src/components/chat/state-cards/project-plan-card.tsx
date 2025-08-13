"use client";

import * as React from "react";
import {
  CopilotStepper,
  StepperStage,
} from "@/components/chat/copilot-stepper";
import { ProjectBrief } from "@/contexts/langgraph/langgraph-schema";
import { ProjectPlanWithStatus } from "@/contexts/langgraph/langgraph-schema";
import { AnalyzingStageDetail } from "./analyzing-stage-detail";
import { ProposingStageDetail } from "./proposing-stage-detail";

// Type definitions based on the provided data structure
interface DevBox {
  runtime: string;
  description: string;
}

interface Database {
  type: string;
  description: string;
}

interface ObjectStorageBucket {
  policy: string;
  description: string;
}

interface ProjectResources {
  devboxes: DevBox[];
  databases: Database[];
  buckets: ObjectStorageBucket[];
}

interface ProjectInfo {
  name?: string;
  description?: string;
  resources?: ProjectResources;
}

export interface ProjectPlanCardProps {
  analyzingStatus?: "pending" | "active" | "completed";
  proposingStatus?: "pending" | "active" | "completed";
  title?: string;
  analyzingData?: ProjectBrief; // List of strings for analyzing stage
  proposingData?: ProjectPlanWithStatus; // ProjectInfo for proposing stage
}

export function ProjectPlanCard({
  analyzingStatus = "pending",
  proposingStatus = "pending",
  title = "Project Plan",
  analyzingData = {
    briefs: [""],
    status: "pending",
  },
  proposingData = {
    name: "",
    description: "",
    resources: {
      devboxes: [],
      databases: [],
      buckets: [],
    },
    status: "pending",
  },
}: ProjectPlanCardProps) {
  const stages: StepperStage[] = [
    {
      id: "1",
      title: "Analyzing",
      description: "",
      status: analyzingStatus,
      details: () => (
        <AnalyzingStageDetail 
          analyzingData={analyzingData} 
          analyzingStatus={analyzingStatus} 
        />
      ),
    },
    {
      id: "2",
      title: "Proposing",
      description: "",
      status: proposingStatus,
      details: () => (
        <ProposingStageDetail 
          proposingData={proposingData} 
          proposingStatus={proposingStatus} 
        />
      ),
    },
  ];

  return <CopilotStepper title={title} stages={stages} />;
}

export default ProjectPlanCard;
