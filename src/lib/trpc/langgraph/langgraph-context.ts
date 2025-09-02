import { z } from "zod";

export const LanggraphContextSchema = z.any();

export type LanggraphContext = z.infer<typeof LanggraphContextSchema>;
