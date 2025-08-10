import { z } from "zod";

export const IngressObjectSchema = z.object({
  layer: z
    .any()
    .nullable()
    .optional()
    .describe(
      JSON.stringify({
        resourceType: "ingress",
        path: ["metadata.annotations"],
      })
    )
    .transform((annotations: Record<string, string> | null) => {
      const protocol =
        annotations?.["nginx.ingress.kubernetes.io/backend-protocol"];
      if (protocol && ["WS", "HTTP", "GRPC"].includes(protocol.toUpperCase())) {
        return "application";
      }
      return "transport";
    }),
  protocol: z
    .any()
    .nullable()
    .optional()
    .describe(
      JSON.stringify({
        resourceType: "ingress",
        path: ["metadata.annotations"],
      })
    )
    .transform((annotations: Record<string, string> | null) => {
      const protocol =
        annotations?.["nginx.ingress.kubernetes.io/backend-protocol"];
      if (protocol && ["WS", "HTTP", "GRPC"].includes(protocol.toUpperCase())) {
        return protocol.toUpperCase();
      }
      return "";
    }),
  host: z
    .array(z.any())
    .describe(
      JSON.stringify({
        resourceType: "ingress",
        path: ["spec.rules"],
      })
    )
    .transform((rules) => {
      if (Array.isArray(rules) && rules.length > 0) {
        return rules[0]?.host || "";
      }
      return "";
    }),
  affiliation: z
    .array(z.any())
    .describe(
      JSON.stringify({
        resourceType: "ingress",
        path: ["spec.rules"],
      })
    )
    .transform((rules) => {
      if (Array.isArray(rules) && rules.length > 0) {
        const firstRule = rules[0];
        const firstPath = firstRule?.http?.paths?.[0];
        const service = firstPath?.backend?.service;
        return {
          name: service?.name || "",
          port: service?.port?.number || 0,
        };
      }
      return {
        name: "",
        port: 0,
      };
    }),
});

export type IngressObject = z.infer<typeof IngressObjectSchema>;
