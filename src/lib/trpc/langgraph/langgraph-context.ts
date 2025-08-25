import { z } from "zod";

export const LanggraphContextSchema = z.object({
  apiUrl: z.string().optional(),
});

export type LanggraphContext = z.infer<typeof LanggraphContextSchema>;
