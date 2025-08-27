import { z } from "zod";

// TypeScript interfaces matching the Python model structure
export interface Reliances {
  database?: string[];
  bucket?: string[];
}

export interface DevBox {
  name: string;
  runtime:
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
  reliances?: Reliances;
}

export interface Database {
  name: string;
  type:
    | "postgresql"
    | "mongodb"
    | "apecloud-mysql"
    | "redis"
    | "kafka"
    | "weaviate"
    | "milvus"
    | "pulsar";
}

export interface ObjectStorageBucket {
  name: string;
  policy: "Private" | "PublicRead" | "PublicReadwrite";
}

export interface App {
  name: string;
  image: string;
  reliances?: Reliances;
}

export interface ProjectResources {
  devbox?: DevBox[];
  database?: Database[];
  bucket?: ObjectStorageBucket[];
  app?: App[];
}

export interface ProjectProposal {
  name: string;
  resources: ProjectResources;
}

// Zod schemas matching the Python model structure
export const reliancesSchema = z.object({
  database: z.array(z.string()).optional(),
  bucket: z.array(z.string()).optional(),
});

export const devBoxSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(12, "Name must be 12 characters or less")
    .regex(
      /^[a-z0-9_-]+$/,
      "Name must contain only lowercase letters, numbers, underscores, and hyphens"
    ),
  runtime: z.enum([
    "C++",
    "Nuxt3",
    "Hugo",
    "Java",
    "Chi",
    "PHP",
    "Rocket",
    "Quarkus",
    "Debian",
    "Ubuntu",
    "Spring Boot",
    "Flask",
    "Nginx",
    "Vue.js",
    "Python",
    "VitePress",
    "Node.js",
    "Echo",
    "Next.js",
    "Angular",
    "React",
    "Svelte",
    "Gin",
    "Rust",
    "UmiJS",
    "Docusaurus",
    "Hexo",
    "Vert.x",
    "Go",
    "C",
    "Iris",
    "Astro",
    "MCP",
    "Django",
    "Express.js",
    ".Net",
  ]),
  reliances: reliancesSchema.optional(),
});

export const databaseSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(12, "Name must be 12 characters or less")
    .regex(
      /^[a-z0-9_-]+$/,
      "Name must contain only lowercase letters, numbers, underscores, and hyphens"
    ),
  type: z.enum([
    "postgresql",
    "mongodb",
    "apecloud-mysql",
    "redis",
    "kafka",
    "weaviate",
    "milvus",
    "pulsar",
  ]),
  description: z.string().min(1, "Description is required"),
});

export const objectStorageBucketSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(12, "Name must be 12 characters or less")
    .regex(
      /^[a-z0-9_-]+$/,
      "Name must contain only lowercase letters, numbers, underscores, and hyphens"
    ),
  policy: z.enum(["Private", "PublicRead", "PublicReadwrite"]),
});

export const appSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(12, "Name must be 12 characters or less")
    .regex(
      /^[a-z0-9_-]+$/,
      "Name must contain only lowercase letters, numbers, underscores, and hyphens"
    ),
  image: z
    .string()
    .min(1, "Image is required")
    .regex(
      /^[a-zA-Z0-9._-]+(\/[a-zA-Z0-9._-]+)*(:[a-zA-Z0-9._-]+)?(@sha256:[a-fA-F0-9]{64})?$/,
      "Image must be a valid Docker image format (e.g., nginx, nginx:latest, docker.io/nginx:1.21)"
    ),
  reliances: reliancesSchema.optional(),
});

export const projectResourcesSchema = z.object({
  devbox: z.array(devBoxSchema).optional(),
  database: z.array(databaseSchema).optional(),
  bucket: z.array(objectStorageBucketSchema).optional(),
  app: z.array(appSchema).optional(),
});

export const projectProposalSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(12, "Project name must be 12 characters or less")
    .regex(
      /^[a-z0-9_-]+$/,
      "Project name must contain only lowercase letters, numbers, underscores, and hyphens"
    ),
  resources: projectResourcesSchema,
});

// Form schema with Zod validation
export const projectProposalFormSchema = z.object({
  projectName: z
    .string()
    .min(1, "Project name is required")
    .max(12, "Project name must be 12 characters or less")
    .regex(
      /^[a-z0-9_-]+$/,
      "Project name must contain only lowercase letters, numbers, underscores, and hyphens"
    ),
  resources: projectResourcesSchema,
});

// Type exports
export type ProjectProposalFormValues = z.infer<
  typeof projectProposalFormSchema
>;
export type ProjectProposalType = z.infer<typeof projectProposalSchema>;
