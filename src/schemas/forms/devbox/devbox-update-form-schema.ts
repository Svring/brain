import { z } from "zod";

// Reuse devbox resource schema
import { DevboxResourceSchema } from "./components/devbox-resource-schema";
import { PortSchema } from "../universal/port-schema";

// Update form schema (all fields optional for partial updates)
export const devboxUpdateFormSchema = z.object({
  resource: DevboxResourceSchema.optional(),
  ports: z.array(PortSchema).optional(),
});

export type DevboxUpdateFormData = z.infer<typeof devboxUpdateFormSchema>;
