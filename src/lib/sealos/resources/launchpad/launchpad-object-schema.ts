import { z } from "zod";
import { DeploymentObjectSchema } from "../deployment/deployment-object-schema";
import { StatefulsetObjectSchema } from "../statefulset/statefulset-object-schema";

export const LaunchpadObjectSchema = z.discriminatedUnion("kind", [
  DeploymentObjectSchema.extend({
    kind: z.literal("Deployment"),
  }),
  StatefulsetObjectSchema.extend({
    kind: z.literal("StatefulSet"),
  }),
]);

export type LaunchpadObject = z.infer<typeof LaunchpadObjectSchema>;
