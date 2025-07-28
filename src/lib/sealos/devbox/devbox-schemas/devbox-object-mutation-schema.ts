import { z } from "zod";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

export const DevboxObjectCreateSchema = z.object({
  devbox: z.any(),
  service: z.any(),
  ingress: z.any(),
});

export const DevboxObjectUpdateSchema = z.object({
  resources: z
    .object({
      cpu: z.string().optional(),
      memory: z.string().optional(),
      gpu: z.string().optional(),
    })
    .optional()
    .describe(
      JSON.stringify([
        {
          resourceKind: "devbox",
          patch: {
            op: "replace",
            path: "spec.resource.cpu",
            value: "{{resources.cpu}}",
          },
        },
        {
          resourceKind: "devbox",
          patch: {
            op: "replace",
            path: "spec.resource.memory",
            value: "{{resources.memory}}",
          },
        },
      ])
    ),
  ports: z
    .array(
      z.object({
        extraPorts: z.string(),
        appPorts: z.string(),
        servicePorts: z.string(),
        ingress: z
          .object({
            upsert: z.array(z.string()).optional(),
            delete: z.array(CustomResourceTargetSchema).optional(),
          })
          .optional(),
      })
    )
    .optional()
    .describe(
      JSON.stringify([
        {
          resourceKind: "devbox",
          patch: {
            op: "replace",
            path: "spec.network.extraPorts",
            value: "{{ports.extraPorts}}",
          },
        },
        {
          resourceKind: "devbox",
          patch: {
            op: "replace",
            path: "spec.config.appPorts",
            value: "{{ports.appPorts}}",
          },
        },
        {
          resourceKind: "service",
          patch: {
            op: "replace",
            path: "spec.ports",
            value: "{{ports.servicePorts}}",
          },
        },
      ])
    ),
  upsert: z
    .array(z.string())
    .optional()
    .describe(
      JSON.stringify([
        {
          upsert: {
            resource: "{{upsert}}",
          },
        },
      ])
    ),
  delete: z
    .array(CustomResourceTargetSchema)
    .optional()
    .describe(
      JSON.stringify([
        {
          delete: {
            target: "{{delete}}",
          },
        },
      ])
    ),
});

export type DevboxObjectUpdate = z.infer<typeof DevboxObjectUpdateSchema>;
export type DevboxObjectCreate = z.infer<typeof DevboxObjectCreateSchema>;
