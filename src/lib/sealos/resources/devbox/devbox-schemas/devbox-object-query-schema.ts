import { z } from "zod";
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
  kind: z.string().describe(
    JSON.stringify({
      resourceType: "devbox",
      path: ["kind"],
    })
  ),
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
  resources: z.object({
    cpu: z.any().describe(
      JSON.stringify({
        resourceType: "devbox",
        path: ["spec.resource.cpu"],
      })
    ),
    memory: z.any().describe(
      JSON.stringify({
        resourceType: "devbox",
        path: ["spec.resource.memory"],
      })
    ),
  }),
  ssh: SSHConfigSchema,
  ports: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "devbox",
        path: ["spec.network.extraPorts"],
      })
    )
    .transform((extraPorts) => {
      if (Array.isArray(extraPorts) && extraPorts.length > 0) {
        return extraPorts.map((port: { containerPort: number }) => ({
          number: port.containerPort,
        }));
      }
      return [];
    }),
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
