// Langgraph Schema Types

import { ProjectContextState } from "../project/project-machine";

export type DevBox = {
  runtime: string;
  description: string;
};

export type Database = {
  type: string;
  description: string;
};

export type ObjectStorageBucket = {
  policy: string;
  description: string;
};

export type ProjectResources = {
  devboxes: DevBox[];
  databases: Database[];
  buckets: ObjectStorageBucket[];
};

export type ProjectBrief = {
  briefs: string[];
  status: "pending" | "active" | "completed";
};

export type ProjectPlanWithStatus = {
  name: string;
  description: string;
  resources: ProjectResources;
  status: "pending" | "active" | "completed";
};

export type LanggraphAgentState = {
  base_url: string;
  api_key: string;
  model: string;
  project_context: ProjectContextState;
  project_plan?: ProjectPlanWithStatus;
  project_brief?: ProjectBrief;
};

export type LanggraphEvent =
  | { type: "ACTIVATE" }
  | { type: "DEACTIVATE" }
  | {
      type: "SET_CONFIG";
      base_url?: string;
      api_key?: string;
      model?: string;
    };
