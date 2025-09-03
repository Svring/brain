import { z } from "zod";
import { convertK8sResourceToNumeric } from "@/lib/k8s/k8s-method/k8s-utils";
import {
  formatIsoDateToReadable,
  formatDurationToReadable,
} from "@/lib/date/date-utils";

export const SSHConfigSchema = z.object({
  host: z
    .any()
    .nullable()
    .describe(
      JSON.stringify({
        resourceType: "external",
        note: "current cluster's domain name",
      })
    ),
  port: z.any().describe(
    JSON.stringify({
      resourceType: "devbox",
      path: ["status.network.nodePort"],
    })
  ),
  user: z.any().describe(
    JSON.stringify({
      resourceType: "devbox",
      path: ["spec.config.user"],
    })
  ),
  workingDir: z.any().describe(
    JSON.stringify({
      resourceType: "devbox",
      path: ["spec.config.workingDir"],
    })
  ),
  privateKey: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "secret",
        path: ["data.SEALOS_DEVBOX_PRIVATE_KEY"],
      })
    )
    .transform((val) => Buffer.from(val, "base64").toString("utf-8"))
    .optional(),
});

export type SSHConfig = z.infer<typeof SSHConfigSchema>;

export const DevboxObjectQuerySchema = z.object({
  name: z.any().describe(
    JSON.stringify({
      resourceType: "devbox",
      path: ["metadata.name"],
    })
  ),
  id: z.any().describe(
    JSON.stringify({
      resourceType: "devbox",
      path: ["metadata.uid"],
    })
  ),
  kind: z.string().describe(
    JSON.stringify({
      resourceType: "devbox",
      path: ["kind"],
    })
  ),
  runtime: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "devbox",
        path: ["spec.image"],
      })
    )
    .transform((image) => {
      // Transform the image similar to how devbox node title processes it
      // First extract the image name (remove registry and tag)
      const imageName = image.split(":")[0].split("/").pop() || "";
      // Then apply the same processing as devbox node title: split by "-", remove last part, join back
      return imageName.split("-").slice(0, -1).join("-");
    }),
  image: z.any().describe(
    JSON.stringify({
      resourceType: "devbox",
      path: ["spec.image"],
    })
  ),
  operationalStatus: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "devbox",
        path: [""],
      })
    )
    .transform((resource) => {
      const metadata = resource.metadata;
      const status = resource.status;

      // Get createdAt from metadata and format it
      const createdAt = formatIsoDateToReadable(metadata.creationTimestamp);

      // Calculate upTime from state.running.startedAt
      let upTime: string | undefined;
      if (status?.state?.running?.startedAt) {
        const startedAt = new Date(status.state.running.startedAt);
        const currentTime = new Date();
        const upTimeSeconds = Math.floor(
          (currentTime.getTime() - startedAt.getTime()) / 1000
        ); // Convert to seconds
        upTime = formatDurationToReadable(upTimeSeconds);
      }

      return {
        createdAt,
        upTime,
      };
    }),
  status: z.any().describe(
    JSON.stringify({
      resourceType: "devbox",
      path: ["status.phase"],
    })
  ),
  resources: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "devbox",
        path: ["spec.resource"],
      })
    )
    .transform((resources) => {
      // Convert Kubernetes resource strings to numeric values
      const convertedResource = convertK8sResourceToNumeric({
        cpu: resources.cpu,
        memory: resources.memory,
      });

      return {
        cpu: convertedResource.cpu.original,
        memory: convertedResource.memory.original,
      };
    }),
  ssh: SSHConfigSchema,
  ports: z.any().optional(),
  pods: z
    .any()
    .optional()
    .describe(
      JSON.stringify({
        resourceType: "pod",
        label: "app.kubernetes.io/name",
      })
    )
    .transform((pods) => {
      return pods.map((pod: any) => {
        return {
          name: pod.metadata.name,
          status: pod.status.phase,
        };
      });
    }),
});

export type DevboxObjectQuery = z.infer<typeof DevboxObjectQuerySchema>;
