import { z } from "zod";

// Reuse devbox resource schema
import { DevboxResourceSchema } from "./components/devbox-resource-schema";
import {
  DevboxPortSchema,
  DevboxPortSimpleUpdateSchema,
} from "./components/devbox-port-schema";

// Update form schema (all fields optional for partial updates)
export const devboxUpdateFormSchema = z.object({
  name: z.string().min(1, "DevBox name is required"),
  resource: DevboxResourceSchema.optional(),
  ports: z
    .array(DevboxPortSchema)
    .optional()
    .refine(
      (ports) => {
        // Ensure all ports have unique port numbers
        if (!ports || ports.length === 0) {
          return true; // No ports to validate
        }

        const portNumbers = ports
          .map((port) => port.number)
          .filter((num) => num !== undefined);

        const uniqueNumbers = new Set(portNumbers);

        return uniqueNumbers.size === portNumbers.length;
      },
      {
        message: "All ports must have unique port numbers",
      }
    ),
});

export type DevboxUpdateFormData = z.infer<typeof devboxUpdateFormSchema>;
