import { DevboxCreate } from "../devbox-schemas/devbox-mutation-schema";
import { nanoid } from "@/lib/utils";

// Generate Devbox resource
export function generateDevboxResources({
  name,
  runtime,
  resource,
  ports,
  context,
}: DevboxCreate) {
  // Generate port names once to share between Devbox and Service
  const portNames = ports.map(() => nanoid());

  const devboxResource = {
    apiVersion: "devbox.sealos.io/v1alpha1",
    kind: "Devbox",
    metadata: {
      name,
    },
    spec: {
      squash: false,
      network: {
        type: "NodePort",
        extraPorts: ports.map((port) => ({
          containerPort: port.number,
        })),
      },
      resource: {
        cpu: resource.cpu,
        memory: resource.memory,
      },
      templateID: runtime.template,
      image: runtime.version,
      config: {
        appPorts: ports.map((port, index) => ({
          port: port.number,
          name: portNames[index], // Use shared port name
          protocol: port.protocol,
          targetPort: port.number,
        })),
        ports: [
          {
            containerPort: 22,
            name: "devbox-ssh-port",
            protocol: "TCP",
          },
        ],
        releaseArgs: ["/home/devbox/project/entrypoint.sh"],
        releaseCommand: ["/bin/bash", "-c"],
        user: "devbox",
        workingDir: "/home/devbox/project",
      },
      state: "Running",
      tolerations: [
        {
          key: "devbox.sealos.io/node",
          operator: "Exists",
          effect: "NoSchedule",
        },
      ],
      affinity: {
        nodeAffinity: {
          requiredDuringSchedulingIgnoredDuringExecution: {
            nodeSelectorTerms: [
              {
                matchExpressions: [
                  {
                    key: "devbox.sealos.io/node",
                    operator: "Exists",
                  },
                ],
              },
            ],
          },
        },
      },
    },
  };

  const publicPorts = ports.filter((port) => port.public);
  const domainId = nanoid();
  const ingressResource = {
    apiVersion: "networking.k8s.io/v1",
    kind: "Ingress",
    metadata: {
      name: `${name}-${nanoid()}`, // Unique random suffix
      labels: {
        "cloud.sealos.io/devbox-manager": name,
        "cloud.sealos.io/app-deploy-manager-domain": `${domainId}.${context.host}`,
      },
      annotations: {
        "kubernetes.io/ingress.class": "nginx",
        "nginx.ingress.kubernetes.io/proxy-body-size": "32m",
        "nginx.ingress.kubernetes.io/ssl-redirect": "false",
        "nginx.ingress.kubernetes.io/backend-protocol": "HTTP",
        "nginx.ingress.kubernetes.io/client-body-buffer-size": "64k",
        "nginx.ingress.kubernetes.io/proxy-buffer-size": "64k",
        "nginx.ingress.kubernetes.io/proxy-send-timeout": "300",
        "nginx.ingress.kubernetes.io/proxy-read-timeout": "300",
        "nginx.ingress.kubernetes.io/server-snippet":
          "client_header_buffer_size 64k;\nlarge_client_header_buffers 4 128k;\n",
      },
    },
    spec: {
      rules: [
        {
          host: `${domainId}.${context.host}`,
          http: {
            paths: publicPorts.map((port) => ({
              pathType: "Prefix",
              path: "/",
              backend: {
                service: {
                  name,
                  port: {
                    number: port.number,
                  },
                },
              },
            })),
          },
        },
      ],
      tls: [
        {
          hosts: [`${domainId}.sealosbja.site`],
          secretName: "wildcard-cert",
        },
      ],
    },
  };

  const serviceResource = {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
      name,
      labels: {
        "cloud.sealos.io/devbox-manager": name,
      },
    },
    spec: {
      ports: ports.map((port, index) => ({
        port: port.number,
        targetPort: port.number,
        name: portNames[index], // Use same port name as Devbox
        protocol: port.protocol,
      })),
      selector: {
        "app.kubernetes.io/name": name,
        "app.kubernetes.io/part-of": "devbox",
        "app.kubernetes.io/managed-by": "sealos",
      },
    },
  };

  return [devboxResource, ingressResource, serviceResource];
}
