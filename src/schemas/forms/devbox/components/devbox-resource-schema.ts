import { z } from "zod";
import { ResourceSchema } from "../../universal/resource-schema";

export const DevboxResourceSchema = ResourceSchema.omit({ replicas: true });

export type DevboxResource = z.infer<typeof DevboxResourceSchema>;
