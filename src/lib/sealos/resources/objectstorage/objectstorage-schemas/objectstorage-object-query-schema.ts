import { z } from "zod";

export const ObjectStorageBucketObjectQuerySchema = z.object({
  name: z.string().describe(
    JSON.stringify({
      resourceType: "objectstoragebucket",
      path: ["metadata.name"],
    })
  ),
  policy: z.string().describe(
    JSON.stringify({
      resourceType: "objectstoragebucket",
      path: ["spec.policy"],
    })
  ),
  access: z.object({
    accessKey: z
      .string()
      .describe(
        JSON.stringify({
          resourceType: "secret",
          name: "^object-storage-key-.*-{{instanceName}}$",
          path: ["data.accessKey"],
        })
      )
      .transform((val) => Buffer.from(val, "base64").toString("utf-8")),
    bucket: z
      .string()
      .describe(
        JSON.stringify({
          resourceType: "secret",
          name: "^object-storage-key-.*-{{instanceName}}$",
          path: ["data.bucket"],
        })
      )
      .transform((val) => Buffer.from(val, "base64").toString("utf-8")),
    external: z
      .string()
      .describe(
        JSON.stringify({
          resourceType: "secret",
          name: "^object-storage-key-.*-{{instanceName}}$",
          path: ["data.external"],
        })
      )
      .transform((val) => Buffer.from(val, "base64").toString("utf-8")),
    internal: z
      .string()
      .describe(
        JSON.stringify({
          resourceType: "secret",
          name: "^object-storage-key-.*-{{instanceName}}$",
          path: ["data.internal"],
        })
      )
      .transform((val) => Buffer.from(val, "base64").toString("utf-8")),
    secretKey: z
      .string()
      .describe(
        JSON.stringify({
          resourceType: "secret",
          name: "^object-storage-key-.*-{{instanceName}}$",
          path: ["data.secretKey"],
        })
      )
      .transform((val) => Buffer.from(val, "base64").toString("utf-8")),
  }),
});

export type ObjectStorageBucketObjectQuery = z.infer<
  typeof ObjectStorageBucketObjectQuerySchema
>;
