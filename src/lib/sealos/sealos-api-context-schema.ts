import { z } from "zod";

export const SealosApiContextSchema = z.object({
  baseURL: z.string().optional(),
  authorization: z.string().optional(),
});

export type SealosApiContext = z.infer<typeof SealosApiContextSchema>;
