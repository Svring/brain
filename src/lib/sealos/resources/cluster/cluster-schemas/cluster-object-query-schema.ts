import { z } from "zod";
import { transformComponentSpecsToResources } from "../cluster-utils";
import { convertK8sResourceToNumeric } from "@/lib/k8s/k8s-method/k8s-utils";
import {
  formatIsoDateToReadable,
  formatDurationToReadable,
} from "@/lib/date/date-utils";

export const ClusterObjectQuerySchema = z.object({
  name: z.string().describe(
    JSON.stringify({
      resourceType: "cluster",
      path: ["metadata.name"],
    })
  ),
  kind: z.string().describe(
    JSON.stringify({
      resourceType: "cluster",
      path: ["kind"],
    })
  ),
  type: z.string().describe(
    JSON.stringify({
      resourceType: "cluster",
      path: ["spec.clusterDefinitionRef"],
    })
  ),
  version: z.string().describe(
    JSON.stringify({
      resourceType: "cluster",
      path: ["spec.clusterVersionRef"],
    })
  ),
  status: z
    .string()
    .nullable()
    .describe(
      JSON.stringify({
        resourceType: "cluster",
        path: ["status.phase"],
      })
    ),
  resource: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "cluster",
        path: ["spec.componentSpecs"],
      })
    )
    .transform((data) => {
      const k8sResource = transformComponentSpecsToResources(data);

      // Convert Kubernetes resource strings to numeric values
      const convertedResource = convertK8sResourceToNumeric({
        cpu: k8sResource.cpu,
        memory: k8sResource.memory,
        storage: k8sResource.storage,
      });

      return {
        cpu: convertedResource.cpu.nearest,
        memory: convertedResource.memory.nearest,
        storage: convertedResource.storage.nearest,
        replicas: k8sResource.replicas,
      };
    }),
  operationalStatus: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "cluster",
        path: [""],
      })
    )
    .transform((resource) => {
      const metadata = resource.metadata;

      // Get createdAt from metadata and format it
      const createdAt = formatIsoDateToReadable(metadata.creationTimestamp);

      return {
        createdAt,
      };
    }),
  uptime: z.any().optional(),
  components: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "cluster",
        path: [""],
      })
    )
    .transform((resourece) => {
      const componentSpecs = resourece.spec.componentSpecs;
      const statusComponents = resourece.status?.components;
      if (!Array.isArray(componentSpecs)) return [];

      return componentSpecs.map((spec) => {
        const k8sResource = {
          cpu:
            spec.resources?.limits?.cpu || spec.resources?.requests?.cpu || "0",
          memory:
            spec.resources?.limits?.memory ||
            spec.resources?.requests?.memory ||
            "0",
          storage:
            spec.volumeClaimTemplates?.[0]?.spec?.resources?.requests
              ?.storage || "0",
        };

        // Convert Kubernetes resource strings to numeric values
        const convertedResource = convertK8sResourceToNumeric(k8sResource);

        return {
          name: spec.name,
          status: statusComponents?.[spec.name]?.phase || "unknown",
          resource: {
            cpu: convertedResource.cpu.nearest,
            memory: convertedResource.memory.nearest,
            storage: convertedResource.storage.original,
            replicas: spec.replicas || 0,
          },
        };
      });
    }),
  connection: z.object({
    privateConnection: z.object({
      endpoint: z
        .string()
        .nullable()
        .describe(
          JSON.stringify({
            resourceType: "secret",
            label: "app.kubernetes.io/instance",
            name: "{{instanceName}}-conn-credential$",
            path: ["data.endpoint"],
          })
        )
        .transform((val) =>
          val ? Buffer.from(val, "base64").toString("utf-8") : null
        ),
      host: z
        .string()
        .nullable()
        .describe(
          JSON.stringify({
            resourceType: "secret",
            label: "app.kubernetes.io/instance",
            name: "^{{instanceName}}-conn-credential$",
            path: ["data.host"],
          })
        )
        .transform((val) =>
          val ? Buffer.from(val, "base64").toString("utf-8") : null
        ),
      port: z
        .string()
        .nullable()
        .describe(
          JSON.stringify({
            resourceType: "secret",
            label: "app.kubernetes.io/instance",
            name: "^{{instanceName}}-conn-credential$",
            path: ["data.port"],
          })
        )
        .transform((val) =>
          val ? Buffer.from(val, "base64").toString("utf-8") : null
        ),
      username: z
        .string()
        .nullable()
        .describe(
          JSON.stringify({
            resourceType: "secret",
            label: "app.kubernetes.io/instance",
            name: "^{{instanceName}}-conn-credential$",
            path: ["data.username"],
          })
        )
        .transform((val) =>
          val ? Buffer.from(val, "base64").toString("utf-8") : null
        ),
      password: z
        .string()
        .nullable()
        .describe(
          JSON.stringify({
            resourceType: "secret",
            label: "app.kubernetes.io/instance",
            name: "^{{instanceName}}-conn-credential$",
            path: ["data.password"],
          })
        )
        .transform((val) =>
          val ? Buffer.from(val, "base64").toString("utf-8") : null
        ),
    }),
    publicConnection: z
      .any()
      .optional()
      .describe(
        JSON.stringify({
          resourceType: "service",
          label: "app.kubernetes.io/instance",
          name: "^{{instanceName}}-export$",
          path: [""],
        })
      )
      .transform((service) => {
        if (!service || !service.spec?.ports?.[0]?.nodePort) {
          return null;
        }
        return {
          port: service.spec.ports[0].nodePort,
        };
      }),
  }),
  backup: z.any().describe(
    JSON.stringify({
      resourceType: "cluster",
      path: ["spec.backup"],
    })
  ),
  // NOTE: cluster pod may have multiple containers, which represent the real status of the pod, the current status need to be refined.
  pods: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "pod",
        label: "app.kubernetes.io/instance",
      })
    )
    .transform((pods) => {
      return pods.map((pod: any) => {
        // Calculate upTime from pod startTime
        let upTime: string | undefined;
        if (pod.status?.startTime) {
          const startedAt = new Date(pod.status.startTime);
          const currentTime = new Date();
          const upTimeSeconds = Math.floor(
            (currentTime.getTime() - startedAt.getTime()) / 1000
          ); // Convert to seconds
          upTime = formatDurationToReadable(upTimeSeconds);
        }

        return {
          name: pod.metadata.name,
          status: pod.status.phase,
          upTime,
          containers:
            pod.status.containerStatuses?.map((container: any) => ({
              name: container.name,
              ready: container.ready,
              state: container.state,
              restartCount: container.restartCount,
            })) || [],
        };
      });
    })
    .optional(),
});

export type ClusterObjectQuery = z.infer<typeof ClusterObjectQuerySchema>;
