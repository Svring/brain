import { z } from "zod";

export const SealosApiContextSchema = z.object({
  baseUrl: z.string().optional(),
  authorization: z.string().optional(),
});

export type SealosApiContext = z.infer<typeof SealosApiContextSchema>;
