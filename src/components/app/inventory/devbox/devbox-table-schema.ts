import { z } from "zod";

export const devboxTableSchema = z.object({
  name: z.string(),
  template: z.string(),
  status: z.string(),
  createdAt: z.string(),
  cost: z.string(),
  project: z.string(),
});

export type DevboxColumn = z.infer<typeof devboxTableSchema>;
