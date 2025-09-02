import { z } from "zod";

// Command schema (no defaults here; defaults are applied in composed schemas)
export const CommandSchema = z.string().array();

export type Command = z.infer<typeof CommandSchema>;
