import { z } from "zod";

export const DeploymentObjectSchema = z.object({
  name: z.string().describe(
    JSON.stringify({
      resourceType: "deployment",
      path: ["metadata.name"],
    })
  ),
  image: z.array(
    z.object({
      name: z.string().describe(
        JSON.stringify({
          resourceType: "deployment",
          path: ["spec.template.spec.containers", "image"],
        })
      ),
    })
  ),
  status: z.object({
    replicas: z.number().describe(
      JSON.stringify({
        resourceType: "deployment",
        path: ["status.replicas"],
      })
    ),
    unavailableReplicas: z
      .number()
      .nullable()
      .optional()
      .describe(
        JSON.stringify({
          resourceType: "deployment",
          path: ["status.unavailableReplicas"],
        })
      ),
  }),
  containers: z.array(
    z.object({
      name: z.string().describe(
        JSON.stringify({
          resourceType: "deployment",
          path: ["spec.template.spec.containers", "name"],
        })
      ),
      image: z.string().describe(
        JSON.stringify({
          resourceType: "deployment",
          path: ["spec.template.spec.containers", "image"],
        })
      ),
      command: z
        .string()
        .nullable()
        .describe(
          JSON.stringify({
            resourceType: "deployment",
            path: ["spec.template.spec.containers", "command"],
          })
        )
        .optional(),
      requests: z
        .object({
          cpu: z.string(),
          memory: z.string(),
        })
        .describe(
          JSON.stringify({
            resourceType: "deployment",
            path: ["spec.template.spec.containers", "resources.requests"],
          })
        ),
      limits: z
        .object({
          cpu: z.string(),
          memory: z.string(),
        })
        .describe(
          JSON.stringify({
            resourceType: "deployment",
            path: ["spec.template.spec.containers", "resources.limits"],
          })
        ),
      ports: z
        .any()
        .describe(
          JSON.stringify({
            resourceType: "deployment",
            path: ["spec.template.spec.containers", "ports"],
          })
        )
        .transform((data) => {
          if (Array.isArray(data)) {
            return JSON.stringify(data);
          }
          return typeof data === "string" ? data : "";
        })
        .optional(),
      env: z
        .any()
        .describe(
          JSON.stringify({
            resourceType: "deployment",
            path: ["spec.template.spec.containers", "env"],
          })
        )
        .transform((data) => {
          if (Array.isArray(data)) {
            return JSON.stringify(data);
          }
          return typeof data === "string" ? data : "";
        })
        .optional(),
    })
  ),
  configMap: z
    .array(
      z.object({
        name: z.string(),
        path: z.string(),
      })
    )
    .optional(),
  localStorage: z
    .array(
      z.object({
        name: z.string(),
        path: z.string(),
      })
    )
    .optional(),
});

export type DeploymentObject = z.infer<typeof DeploymentObjectSchema>;
