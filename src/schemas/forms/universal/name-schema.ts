import { z } from "zod";

// Application name schema (no defaults here; defaults are applied in composed schemas)
export const NameSchema = z
  .string()
  .min(1, "Name is required")
  .max(60, "Name must be 60 characters or less")
  .regex(
    /^[a-z][a-z0-9-]*$/,
    "Name must start with a letter, followed by lowercase letters, digits, or hyphens (-)"
  );

export type Name = z.infer<typeof NameSchema>;
