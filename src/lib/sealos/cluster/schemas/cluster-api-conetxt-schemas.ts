import { z } from "zod";

export const ClusterApiContextSchema = z.object({
  baseURL: z.string().optional(),
  authorization: z.string().optional(),
});

export type ClusterApiContext = z.infer<typeof ClusterApiContextSchema>;
