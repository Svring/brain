"use client";

import { ClusterApiContextSchema } from "./schemas/cluster-api-context-schemas";
import { nanoid } from "nanoid";
import { useAuthState } from "@/contexts/auth/auth-context";

export function createClusterContext() {
  const { auth } = useAuthState();
  if (!auth) {
    throw new Error("User not found");
  }
  return ClusterApiContextSchema.parse({
    baseURL: auth?.regionUrl,
    authorization: auth?.kubeconfig,
  });
}

export function generateClusterName() {
  return `cluster-${nanoid(12)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")}`;
}

/**
 * Cluster connection credentials extracted from secret
 */
export interface ClusterCredentials {
  endpoint: string;
  host: string;
  password: string;
  port: string;
  username: string;
}

/**
 * Kubernetes Secret structure for cluster credentials
 */
export interface ClusterSecret {
  apiVersion: "v1";
  kind: "Secret";
  type: "Opaque";
  metadata: {
    name: string;
    namespace: string;
    creationTimestamp: string;
    resourceVersion: string;
    uid: string;
    labels?: Record<string, string>;
    ownerReferences?: Array<{
      apiVersion: string;
      kind: string;
      name: string;
      uid: string;
      blockOwnerDeletion?: boolean;
      controller?: boolean;
    }>;
    finalizers?: string[];
  };
  data: {
    endpoint: string; // Base64 encoded
    host: string; // Base64 encoded
    password: string; // Base64 encoded
    port: string; // Base64 encoded
    username: string; // Base64 encoded
  };
}

/**
 * Extract and decode cluster credentials from Kubernetes secret
 * @param secret - The cluster connection credential secret
 * @returns Decoded cluster credentials
 */
export function extractClusterCredentials(
  secret: ClusterSecret
): ClusterCredentials {
  if (!secret.data) {
    throw new Error("Secret data is missing");
  }

  const requiredFields = ["endpoint", "host", "password", "port", "username"];
  const missingFields = requiredFields.filter(
    (field) => !secret.data[field as keyof typeof secret.data]
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required secret fields: ${missingFields.join(", ")}`
    );
  }

  try {
    return {
      endpoint: atob(secret.data.endpoint),
      host: atob(secret.data.host),
      password: atob(secret.data.password),
      port: atob(secret.data.port),
      username: atob(secret.data.username),
    };
  } catch (error) {
    throw new Error("Failed to decode base64 secret data");
  }
}

/**
 * Validate cluster credentials structure
 * @param credentials - Credentials to validate
 * @returns True if valid, throws error if invalid
 */
export function validateClusterCredentials(
  credentials: ClusterCredentials
): boolean {
  const requiredFields = ["endpoint", "host", "password", "port", "username"];

  for (const field of requiredFields) {
    if (!credentials[field as keyof ClusterCredentials]) {
      throw new Error(`Invalid credentials: missing ${field}`);
    }
  }

  // Validate port is a number
  const port = parseInt(credentials.port, 10);
  if (isNaN(port) || port <= 0 || port > 65535) {
    throw new Error("Invalid port number");
  }

  return true;
}

/**
 * Create a connection string from cluster credentials
 * @param credentials - Cluster credentials
 * @returns Database connection string
 */
export function createConnectionString(
  credentials: ClusterCredentials
): string {
  validateClusterCredentials(credentials);

  return `postgresql://${credentials.username}:${credentials.password}@${credentials.endpoint}`;
}

/**
 * Parse connection endpoint into host and port
 * @param endpoint - Connection endpoint (host:port format)
 * @returns Object with host and port
 */
export function parseEndpoint(endpoint: string): {
  host: string;
  port: number;
} {
  const [host, portStr] = endpoint.split(":");
  const port = parseInt(portStr, 10);

  if (!host || isNaN(port)) {
    throw new Error("Invalid endpoint format");
  }

  return { host, port };
}

/**
 * Environment variable structure for K8s resources
 */
export interface EnvVar {
  type: "secretKeyRef";
  key: string;
  secretName: string;
  secretKey: string;
}

/**
 * Create environment variables for cluster database connection
 * @param secretName - Name of the cluster secret
 * @param clusterName - Name of the cluster
 * @returns Array of environment variables for database connection
 */
export function createClusterEnvVars(
  secretName: string,
  clusterName: string
): EnvVar[] {
  const prefix = clusterName.toUpperCase().replace(/[^A-Z0-9]/g, "_");
  return [
    {
      type: "secretKeyRef",
      key: `${prefix}_DB_HOST`,
      secretName,
      secretKey: "host",
    },
    {
      type: "secretKeyRef",
      key: `${prefix}_DB_PORT`,
      secretName,
      secretKey: "port",
    },
    {
      type: "secretKeyRef",
      key: `${prefix}_DB_USER`,
      secretName,
      secretKey: "username",
    },
    {
      type: "secretKeyRef",
      key: `${prefix}_DB_PASSWORD`,
      secretName,
      secretKey: "password",
    },
    {
      type: "secretKeyRef",
      key: `${prefix}_DB_ENDPOINT`,
      secretName,
      secretKey: "endpoint",
    },
  ];
}
