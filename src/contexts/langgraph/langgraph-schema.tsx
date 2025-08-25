// Langgraph Schema Types

import { ProjectContextState } from "../project/project-machine";

// All possible runtime names from the langgraph schema
export type LanggraphRuntime =
  | "C++"
  | "Nuxt3"
  | "Hugo"
  | "Java"
  | "Chi"
  | "PHP"
  | "Rocket"
  | "Quarkus"
  | "Debian"
  | "Ubuntu"
  | "Spring Boot"
  | "Flask"
  | "Nginx"
  | "Vue.js"
  | "Python"
  | "VitePress"
  | "Node.js"
  | "Echo"
  | "Next.js"
  | "Angular"
  | "React"
  | "Svelte"
  | "Gin"
  | "Rust"
  | "UmiJS"
  | "Docusaurus"
  | "Hexo"
  | "Vert.x"
  | "Go"
  | "C"
  | "Iris"
  | "Astro"
  | "MCP"
  | "Django"
  | "Express.js"
  | ".Net";

export type DevBox = {
  runtime: LanggraphRuntime;
  description: string;
};

export type Database = {
  type:
    | "postgresql"
    | "mongodb"
    | "apecloud-mysql"
    | "redis"
    | "kafka"
    | "weaviate"
    | "milvus"
    | "pulsar";
  description: string;
};

export type ObjectStorageBucket = {
  policy: "Private" | "PublicRead" | "PublicReadwrite";
  description: string;
};

export type ProjectResources = {
  devboxes: DevBox[];
  databases: Database[];
  buckets: ObjectStorageBucket[];
};

export type ProjectProposal = {
  name: string;
  description: string;
  resources: ProjectResources;
};

export type BrainState = {
  base_url: string;
  api_key: string;
  model: string;
  stage: "propose_project" | "manage_project";
  project_context: ProjectContextState;
};

export type LanggraphEvent =
  | {
      type: "SET_CONFIG";
      base_url?: string;
      api_key?: string;
      model?: string;
    }
  | {
      type: "SET_STAGE";
      stage: "propose_project" | "manage_project";
    }
  | {
      type: "SET_PROJECT_CONTEXT";
      project_context: ProjectContextState;
    };
