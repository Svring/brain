// Main project proposal component
export { ProjectProposalCard } from "./project-proposal-card";

// Individual resource card components
export { ProjectDevBoxCard } from "./project-devbox-card";
export { ProjectDatabaseCard } from "./project-database-card";
export { ProjectBucketCard } from "./project-bucket-card";
export { ProjectAppCard } from "./project-app-card";

// Export types for use in other components
export type {
  ProjectProposal,
  DevBox,
  Database,
  ObjectStorageBucket,
  App,
  Reliances,
} from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";