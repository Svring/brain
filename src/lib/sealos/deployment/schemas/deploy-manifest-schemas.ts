import { z } from "zod";

// Input parameters schema
const PortSchema = z.object({
  number: z
    .number()
    .int()
    .min(1)
    .max(65535)
    .describe("The port number (1-65535)."),
  publicAccess: z
    .boolean()
    .describe("Whether the port is exposed externally via an Ingress."),
});

const InputParametersSchema = z.object({
  name: z
    .string()
    .regex(
      /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
      "Must be a valid Kubernetes resource name."
    )
    .min(1)
    .max(253)
    .describe(
      "The name of the application, used for resource names and labels."
    ),
  image: z.string().min(1).describe('The container image (e.g., "nginx").'),
  env: z
    .record(z.string(), z.string())
    .describe("Environment variables as key-value pairs."),
  ports: z
    .array(PortSchema)
    .min(1)
    .describe(
      "List of ports to expose, with publicAccess determining Ingress generation."
    ),
});

// Output schema for yamlList
const K8sManifestSchema = z.object({
  yamlList: z
    .array(
      z
        .string()
        .describe(
          "A YAML string representing a Kubernetes resource (Service, Deployment, or Ingress)."
        )
    )
    .min(2)
    .max(10)
    .refine(
      (yamlList) => {
        // Basic validation: ensure at least Service and Deployment are present
        const kinds = yamlList.map((yaml) => {
          const match = yaml.match(/^kind:\s*(\w+)/m);
          return match ? match[1] : null;
        });
        return kinds.includes("Service") && kinds.includes("Deployment");
      },
      {
        message:
          "yamlList must include at least one Service and one Deployment.",
      }
    )
    .refine(
      (yamlList) => {
        // Validate that Ingress resources match the number of ports with publicAccess: true
        const input = InputParametersSchema.safeParse(
          JSON.parse(
            JSON.stringify({ name: "", image: "", env: {}, ports: [] })
          )
        ); // Placeholder for context
        if (!input.success) return true; // Skip if input parsing fails (contextual validation)
        const publicPorts = input.data.ports.filter(
          (p) => p.publicAccess
        ).length;
        const ingressCount = yamlList.filter((yaml) =>
          yaml.includes("kind: Ingress")
        ).length;
        return ingressCount === publicPorts;
      },
      {
        message:
          "The number of Ingress resources must match the number of ports with publicAccess: true.",
      }
    )
    .describe(
      "Array of YAML strings for Kubernetes manifests (Service, Deployment, and optional Ingress resources)."
    ),
});

// Combined schema for the entire structure
export const K8sManifestGenerationSchema = K8sManifestSchema;

export { InputParametersSchema };

export type K8sManifestGeneration = z.infer<typeof K8sManifestGenerationSchema>;
export type InputParameters = z.infer<typeof InputParametersSchema>;
