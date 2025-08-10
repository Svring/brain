import { nanoid } from "nanoid";
import yaml from "js-yaml";
import type {
  InputParameters,
  K8sManifestGeneration,
} from "./schemas/deploy-manifest-schemas";

export function generateServiceJson(params: InputParameters) {
  const { name, ports } = params;
  const servicePorts = ports.map((port) => ({
    port: port.number,
    targetPort: port.number,
    name: nanoid(12),
    protocol: "TCP",
  }));
  return {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
      name,
      labels: {
        "cloud.sealos.io/app-deploy-manager": name,
      },
    },
    spec: {
      ports: servicePorts,
      selector: {
        app: name,
      },
    },
  };
}

export function generateDeployJson(params: InputParameters) {
  const { name, image, env, ports } = params;
  const timestamp = "20250711170300"; // Hardcoded as per example
  const servicePorts = ports.map((port) => ({
    port: port.number,
    targetPort: port.number,
    name: nanoid(12),
    protocol: "TCP",
  }));
  const envEntries = Object.entries(env).map(([key, value]) => ({
    name: key,
    value,
  }));
  const containerPorts = servicePorts.map((p) => ({
    containerPort: p.port,
    name: p.name,
  }));
  return {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: {
      name,
      annotations: {
        originImageName: image,
        "deploy.cloud.sealos.io/minReplicas": "1",
        "deploy.cloud.sealos.io/maxReplicas": "1",
        "deploy.cloud.sealos.io/resize": "0Gi",
      },
      labels: {
        "cloud.sealos.io/app-deploy-manager": name,
        app: name,
      },
    },
    spec: {
      replicas: 1,
      revisionHistoryLimit: 1,
      selector: {
        matchLabels: {
          app: name,
        },
      },
      strategy: {
        type: "RollingUpdate",
        rollingUpdate: {
          maxUnavailable: 0,
          maxSurge: 1,
        },
      },
      template: {
        metadata: {
          labels: {
            app: name,
            restartTime: timestamp,
          },
        },
        spec: {
          automountServiceAccountToken: false,
          containers: [
            {
              name,
              image,
              env: envEntries.length > 0 ? envEntries : undefined,
              resources: {
                requests: { cpu: "20m", memory: "25Mi" },
                limits: { cpu: "200m", memory: "256Mi" },
              },
              ports: containerPorts.length > 0 ? containerPorts : undefined,
              imagePullPolicy: "Always",
              volumeMounts: [],
            },
          ],
          volumes: [],
        },
      },
    },
  };
}

export function generateIngressJson(params: InputParameters) {
  const { name, ports } = params;
  const manifests: any[] = [];
  ports.forEach((port) => {
    if (port.publicAccess) {
      const domainId = nanoid(12);
      const ingressName = `network-${nanoid(12)}`;
      manifests.push({
        apiVersion: "networking.k8s.io/v1",
        kind: "Ingress",
        metadata: {
          name: ingressName,
          labels: {
            "cloud.sealos.io/app-deploy-manager": name,
            "cloud.sealos.io/app-deploy-manager-domain": domainId,
          },
          annotations: {
            "kubernetes.io/ingress.class": "nginx",
            "nginx.ingress.kubernetes.io/proxy-body-size": "32m",
            "nginx.ingress.kubernetes.io/ssl-redirect": "'false'",
            "nginx.ingress.kubernetes.io/backend-protocol": "HTTP",
            "nginx.ingress.kubernetes.io/client-body-buffer-size": "64k",
            "nginx.ingress.kubernetes.io/proxy-buffer-size": "64k",
            "nginx.ingress.kubernetes.io/proxy-send-timeout": "'300'",
            "nginx.ingress.kubernetes.io/proxy-read-timeout": "'300'",
            "nginx.ingress.kubernetes.io/server-snippet":
              "|\n      client_header_buffer_size 64k;\n      large_client_header_buffers 4 128k;",
          },
        },
        spec: {
          rules: [
            {
              host: `${domainId}.sealosbja.site`,
              http: {
                paths: [
                  {
                    pathType: "Prefix",
                    path: "/",
                    backend: {
                      service: {
                        name,
                        port: { number: port.number },
                      },
                    },
                  },
                ],
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
      });
    }
  });
  return manifests;
}

export function generateServiceYaml(params: InputParameters): string {
  return yaml.dump(generateServiceJson(params));
}

export function generateDeployYaml(params: InputParameters): string {
  return yaml.dump(generateDeployJson(params));
}

export function generateIngressYaml(params: InputParameters): string {
  return generateIngressJson(params)
    .map((obj) => yaml.dump(obj))
    .join("---\n");
}

export function generateDeployName() {
  return `deploy-${nanoid(12)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")}`;
}

function generateK8sManifests(params: InputParameters): K8sManifestGeneration {
  const serviceYaml = generateServiceYaml(params);
  const deployYaml = generateDeployYaml(params);
  const ingressYaml = generateIngressYaml(params);
  const yamlList = [serviceYaml, deployYaml];
  if (ingressYaml.trim() !== "") {
    yamlList.push(ingressYaml);
  }
  return { yamlList };
}

export default generateK8sManifests;
