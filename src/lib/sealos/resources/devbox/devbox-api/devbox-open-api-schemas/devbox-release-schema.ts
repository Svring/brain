import { z } from "zod";

// Release DevBox schemas
export const DevboxReleaseRequestSchema = z.object({
  devboxName: z.string().min(1, "DevBox name is required"),
  tag: z.string().min(1, "Release tag is required"),
  releaseDes: z.string().optional().default(""),
});

export const DevboxReleaseResponseSchema = z.object({
  data: z.object({
    devboxName: z.string(),
    tag: z.string(),
    releaseDes: z.string(),
    image: z.string().optional(),
    createdAt: z.string(),
  }),
});

// Get DevBox releases schemas
export const DevboxReleasesRequestSchema = z.object({
  devboxName: z.string().min(1, "DevBox name is required"),
});

export const DevboxReleaseStatusSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const DevboxReleaseItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  devboxName: z.string(),
  createTime: z.string(),
  tag: z.string(),
  status: DevboxReleaseStatusSchema,
  description: z.string(),
});

export const DevboxReleasesResponseSchema = z.object({
  data: z.array(DevboxReleaseItemSchema),
});

// Deploy DevBox schemas
export const DevboxDeployRequestSchema = z.object({
  devboxName: z.string().min(1, "DevBox name is required"),
  tag: z.string().min(1, "Devbox release version tag is required"),
  cpu: z.number().min(0).optional().default(2000),
  memory: z.number().min(0).optional().default(4096),
});

export const DevboxPublicDomainSchema = z.object({
  host: z.string(),
  port: z.number(),
});

export const DevboxDeployResponseSchema = z.object({
  data: z.object({
    message: z.string().default("success deploy devbox"),
    appName: z.string(),
    publicDomains: z.array(DevboxPublicDomainSchema),
  }),
});

// Type exports
export type DevboxReleaseRequest = z.infer<typeof DevboxReleaseRequestSchema>;
export type DevboxReleaseResponse = z.infer<typeof DevboxReleaseResponseSchema>;
export type DevboxReleasesRequest = z.infer<typeof DevboxReleasesRequestSchema>;
export type DevboxReleasesResponse = z.infer<
  typeof DevboxReleasesResponseSchema
>;
export type DevboxReleaseItem = z.infer<typeof DevboxReleaseItemSchema>;
export type DevboxReleaseStatus = z.infer<typeof DevboxReleaseStatusSchema>;
export type DevboxDeployRequest = z.infer<typeof DevboxDeployRequestSchema>;
export type DevboxDeployResponse = z.infer<typeof DevboxDeployResponseSchema>;
export type DevboxPublicDomain = z.infer<typeof DevboxPublicDomainSchema>;
