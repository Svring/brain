import { z } from "zod";

export const DevboxCreateSchema = z.object({
  name: z.string(),
  runtime: z.object({
    template: z.string(),
    version: z.string(),
  }),
  resource: z.object({
    cpu: z.string(),
    memory: z.string(),
  }),
  ports: z.array(
    z.object({
      number: z.number(),
      protocol: z.string(),
      public: z.boolean(),
    })
  ),
  context: z.object({
    host: z.string(),
  }),
});

export const DevboxUpdateSchema = z.object({
  resource: z
    .object({
      cpu: z.string(),
      memory: z.string(),
    })
    .optional(),
  ports: z
    .array(
      z.object({
        number: z.number(),
        protocol: z.string(),
        public: z.boolean(),
      })
    )
    .optional(),
});

export const DevboxDeleteSchema = z.object({
  name: z.string(),
});

export type DevboxCreate = z.infer<typeof DevboxCreateSchema>;
export type DevboxUpdate = z.infer<typeof DevboxUpdateSchema>;
export type DevboxDelete = z.infer<typeof DevboxDeleteSchema>;
export type DevboxPort = DevboxCreate["ports"][number];
