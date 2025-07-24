import { z } from "zod";

export const ClusterNodeDataSchema = z.object({
  name: z.string(),
  type: z.string(),
  version: z.string(),
  status: z.string(),
  resources: z.object({
    cpu: z.string(),
    memory: z.string(),
    storage: z.string(),
  }),
  connection: z.object({
    privateConnection: z.string(),
    publicConnection: z.string().optional(),
  }),
  pods: z
    .array(
      z.object({
        name: z.string(),
      })
    )
    .optional(),
});

export type ClusterNodeData = z.infer<typeof ClusterNodeDataSchema>;
