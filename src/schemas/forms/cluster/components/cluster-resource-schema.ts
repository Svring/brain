import { z } from "zod";
import { ResourceSchema } from "../../universal/resource-schema";

export const ClusterResourceSchema = ResourceSchema.extend({
  storage: z.number().min(0.1, "Storage must be at least 0.1 GB").default(10),
});

export type ClusterResource = z.infer<typeof ClusterResourceSchema>;
