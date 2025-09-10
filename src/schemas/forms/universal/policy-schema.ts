import { z } from "zod";

// Policy schema for object storage access control
export const PolicySchema = z.enum([
  "private",
  "publicRead",
  "publicReadwrite",
]);

export type Policy = z.infer<typeof PolicySchema>;
