import { z } from "zod";
import { DEVBOX_RUNTIMES } from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-runtimes";
import { CLUSTER_TYPES } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-types";

// TypeScript interfaces matching the Python model structure
// Shared port schema
export const PortSchema = z.object({
  number: z.number().int().min(1).max(65535),
  publicAccess: z.boolean(),
});

// Zod schemas matching the Python model structure
export const ReliancesSchema = z.object({
  database: z.array(z.string()).optional().nullable(),
  bucket: z.array(z.string()).optional().nullable(),
});

export const DevBoxSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(24, "Name must be 24 characters or less")
    .regex(
      /^[a-z0-9_-]+$/,
      "Name must contain only lowercase letters, numbers, underscores, and hyphens"
    ),
  runtime: z.enum(DEVBOX_RUNTIMES),
  ports: z.array(PortSchema).optional().nullable(),
  reliances: ReliancesSchema.optional().nullable(),
});

export const DatabaseSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(24, "Name must be 24 characters or less")
    .regex(
      /^[a-z0-9_-]+$/,
      "Name must contain only lowercase letters, numbers, underscores, and hyphens"
    ),
  type: z.enum([...CLUSTER_TYPES] as [string, ...string[]]),
});

export const ObjectStorageBucketSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(24, "Name must be 24 characters or less")
    .regex(
      /^[a-z0-9_-]+$/,
      "Name must contain only lowercase letters, numbers, underscores, and hyphens"
    ),
  policy: z.enum(["private", "publicRead", "publicReadWrite"]),
});

export const AppEnvSchema = z.object({
  name: z.string().min(1, "Environment variable name is required"),
  value: z.string().min(1, "Environment variable value is required"),
});

export const AppSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(24, "Name must be 24 characters or less")
    .regex(
      /^[a-z0-9_-]+$/,
      "Name must contain only lowercase letters, numbers, underscores, and hyphens"
    ),
  image: z
    .string()
    .min(1, "Image is required")
    .regex(
      /^[a-zA-Z0-9._-]+(\/[a-zA-Z0-9._-]+)*(:[a-zA-Z0-9._-]+)?(@sha256:[a-fA-Z0-9]{64})?$/,
      "Image must be a valid Docker image format (e.g., nginx, nginx:latest, docker.io/nginx:1.21)"
    ),
  ports: z.array(PortSchema).optional().nullable(),
  env: z.array(AppEnvSchema).optional().nullable(),
  reliances: ReliancesSchema.optional().nullable(),
});

export const ProjectResourcesSchema = z.object({
  devbox: z.array(DevBoxSchema).optional().nullable(),
  database: z.array(DatabaseSchema).optional().nullable(),
  bucket: z.array(ObjectStorageBucketSchema).optional().nullable(),
  app: z.array(AppSchema).optional().nullable(),
});

export const ProjectProposalSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(24, "Project name must be 24 characters or less")
    .regex(
      /^[a-z0-9_-]+$/,
      "Project name must contain only lowercase letters, numbers, underscores, and hyphens"
    ),
  resources: ProjectResourcesSchema,
});

// Form schema with Zod validation
export const ProjectProposalFormSchema = z.object({
  projectName: z
    .string()
    .min(1, "Project name is required")
    .max(24, "Project name must be 24 characters or less")
    .regex(
      /^[a-z0-9_-]+$/,
      "Project name must contain only lowercase letters, numbers, underscores, and hyphens"
    ),
  resources: ProjectResourcesSchema,
});

// Inferred types from schemas
export type Reliances = z.infer<typeof ReliancesSchema>;
export type Port = z.infer<typeof PortSchema>;
export type DevBox = z.infer<typeof DevBoxSchema>;
export type Database = z.infer<typeof DatabaseSchema>;
export type ObjectStorageBucket = z.infer<typeof ObjectStorageBucketSchema>;
export type App = z.infer<typeof AppSchema>;
export type AppEnv = z.infer<typeof AppEnvSchema>;
export type ProjectResources = z.infer<typeof ProjectResourcesSchema>;
export type ProjectProposal = z.infer<typeof ProjectProposalSchema>;
export type DatabaseType = Database["type"];

export type ProjectProposalFormValues = z.infer<
  typeof ProjectProposalFormSchema
>;
export type ProjectProposalType = z.infer<typeof ProjectProposalSchema>;
