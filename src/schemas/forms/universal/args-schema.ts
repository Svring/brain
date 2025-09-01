import { z } from "zod";

// Arguments schema (no defaults here; defaults are applied in composed schemas)
export const ArgsSchema = z.string();

export type Args = z.infer<typeof ArgsSchema>;
