import { z } from "zod";

export const DevboxNodeDataSchema = z.object({
  name: z.string(),
  image: z.string(),
  status: z.string(),
  resources: z.object({
    cpu: z.string(),
    memory: z.string(),
  }),
  ssh: z.object({
    host: z.string(),
    port: z.string(),
    user: z.string(),
    privateKey: z.string(),
  }),
  ports: z.array(
    z.object({
      number: z.number(),
      protocol: z.string(),
      publicDomain: z.string().optional(),
    })
  ),
  env: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
      })
    )
    .optional(),
  pods: z
    .array(
      z.object({
        name: z.string(),
      })
    )
    .optional(),
});

export type DevboxNodeData = z.infer<typeof DevboxNodeDataSchema>;
