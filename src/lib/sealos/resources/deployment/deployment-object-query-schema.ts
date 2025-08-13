import { z } from "zod";

export const DeploymentObjectQuerySchema = z.object({
  name: z.string().describe(
    JSON.stringify({
      resourceType: "deployment",
      path: ["metadata.name"],
    })
  ),
  kind: z.string().describe(
    JSON.stringify({
      resourceType: "deployment",
      path: ["kind"],
    })
  ),
  image: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "deployment",
        path: ["spec.template.spec.containers"],
      })
    )
    .transform((containers) => {
      if (Array.isArray(containers) && containers.length > 0) {
        return containers[0].image;
      }
      return "";
    }),
  resource: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "deployment",
        path: ["spec"],
      })
    )
    .transform((spec) => {
      const replicas = spec.replicas;
      const containers = spec.template.spec.containers;
      if (Array.isArray(containers) && containers.length > 0) {
        return {
          replicas,
          ...containers[0].resources.limits,
        };
      }
      return {};
    }),
  status: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "deployment",
        path: [""],
      })
    )
    .transform((resource) => {
      const status = resource.status;
      const paused =
        resource.metadata.annotations?.["deploy.cloud.sealos.io/pause"];
      return {
        replicas: status.replicas,
        readyReplicas: status.readyReplicas,
        unavailableReplicas: status.unavailableReplicas,
        availableReplicas: status.availableReplicas,
        paused: paused ? true : false,
      };
    }),
  env: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "deployment",
        path: ["spec.template.spec.containers"],
      })
    )
    .transform((containers) => {
      if (Array.isArray(containers) && containers.length > 0) {
        return containers[0].env;
      }
      return [];
    })
    .optional(),
  ports: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "deployment",
        path: ["spec.template.spec.containers"],
      })
    )
    .transform((containers) => {
      if (Array.isArray(containers) && containers.length > 0) {
        return containers[0].ports.map((port: { containerPort: number }) => ({
          number: port.containerPort,
        }));
      }
      return [];
    })
    .optional(),
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
  pods: z
    .any()
    .optional()
    .describe(
      JSON.stringify({
        resourceType: "pod",
        label: "app",
      })
    )
    .transform((pods) => {
      return pods.map((pod: any) => {
        return {
          name: pod.metadata.name,
          status: pod.status.containerStatuses[0].ready ? "Running" : "Waiting",
          containers: pod.status.containerStatuses.map((container: any) => ({
            name: container.name,
            ready: container.ready,
            state: container.state,
          })),
        };
      });
    }),
});

export type DeploymentObjectQuery = z.infer<typeof DeploymentObjectQuerySchema>;
