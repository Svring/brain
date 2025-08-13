"use client";

import * as React from "react";
import {
  CopilotStepper,
  StepperStage,
} from "@/components/chat/copilot-stepper";
import { ProjectBrief } from "@/contexts/langgraph/langgraph-schema";
import { ProjectPlanWithStatus } from "@/contexts/langgraph/langgraph-schema";

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
        <div className="p-3 rounded-lg">
          {analyzingData.briefs.length > 0 ? (
            <div>
              <h4 className="font-medium mb-1">Analysis Results:</h4>
              <ul className="space-y-0.5">
                {analyzingData.briefs.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No analysis data available
            </p>
          )}
        </div>
      ),
    },
    {
      id: "2",
      title: "Proposing",
      description: "",
      status: proposingStatus,
      details: () => (
        <div className="p-3 rounded-lg">
          {proposingData ? (
            <div className="space-y-3">
              {proposingData.name && (
                <div>
                  <h4 className="font-medium mb-0.5">Project Name:</h4>
                  <p className="text-sm text-muted-foreground">
                    {proposingData.name}
                  </p>
                </div>
              )}

              {proposingData.description && (
                <div>
                  <h4 className="font-medium mb-0.5">Description:</h4>
                  <p className="text-sm text-muted-foreground">
                    {proposingData.description}
                  </p>
                </div>
              )}

              {proposingData.resources && (
                <div className="space-y-2">
                  <h4 className="font-medium">Resources:</h4>

                  {proposingData.resources.devboxes.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-0.5">DevBoxes:</h5>
                      <ul className="space-y-0.5 ml-3">
                        {proposingData.resources.devboxes.map(
                          (devbox, index) => (
                            <li key={index} className="text-sm">
                              <span className="font-medium">
                                {devbox.runtime}
                              </span>
                              {devbox.description && (
                                <span className="text-muted-foreground">
                                  {" "}
                                  - {devbox.description}
                                </span>
                              )}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {proposingData.resources.databases.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-0.5">Databases:</h5>
                      <ul className="space-y-0.5 ml-3">
                        {proposingData.resources.databases.map((db, index) => (
                          <li key={index} className="text-sm">
                            <span className="font-medium">{db.type}</span>
                            {db.description && (
                              <span className="text-muted-foreground">
                                {" "}
                                - {db.description}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {proposingData.resources.buckets.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-0.5">
                        Object Storage Buckets:
                      </h5>
                      <ul className="space-y-0.5 ml-3">
                        {proposingData.resources.buckets.map(
                          (bucket, index) => (
                            <li key={index} className="text-sm">
                              <span className="font-medium">
                                {bucket.policy}
                              </span>
                              {bucket.description && (
                                <span className="text-muted-foreground">
                                  {" "}
                                  - {bucket.description}
                                </span>
                              )}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No project proposal data available
            </p>
          )}
        </div>
      ),
    },
  ];

  return <CopilotStepper title={title} stages={stages} />;
}

export default ProjectPlanCard;
