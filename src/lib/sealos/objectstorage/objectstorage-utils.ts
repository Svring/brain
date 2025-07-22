"use client";

import { ObjectStorageApiContextSchema } from "./schemas/objectstorage-api-context-schemas";
import { nanoid } from "nanoid";
import { useAuthState } from "@/contexts/auth/auth-context";

export function createObjectStorageContext() {
  const { auth } = useAuthState();
  if (!auth) {
    throw new Error("User not found");
  }
  return ObjectStorageApiContextSchema.parse({
    baseURL: auth.regionUrl,
    authorization: auth.kubeconfig,
  });
}

export function generateObjectStorageName() {
  return `bucket-${nanoid(12)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")}`;
}

/**
 * Object storage credentials extracted from secret
 */
export interface ObjectStorageCredentials {
  accessKey: string;
  bucket: string;
  external: string;
  internal: string;
  secretKey: string;
}

/**
 * Kubernetes Secret structure for object storage credentials
 */
export interface ObjectStorageSecret {
  apiVersion: "v1";
  kind: "Secret";
  type: "Opaque";
  metadata: {
    name: string;
    namespace: string;
    creationTimestamp: string;
    resourceVersion: string;
    uid: string;
    ownerReferences?: Array<{
      apiVersion: string;
      kind: string;
      name: string;
      uid: string;
    }>;
  };
  data: {
    accessKey: string; // Base64 encoded
    bucket: string; // Base64 encoded
    external: string; // Base64 encoded
    internal: string; // Base64 encoded
    secretKey: string; // Base64 encoded
  };
}

/**
 * Extract and decode object storage credentials from Kubernetes secret
 * @param secret - The object storage key secret
 * @returns Decoded object storage credentials
 */
export function extractObjectStorageCredentials(
  secret: ObjectStorageSecret
): ObjectStorageCredentials {
  if (!secret.data) {
    throw new Error("Secret data is missing");
  }

  const requiredFields = [
    "accessKey",
    "bucket",
    "external",
    "internal",
    "secretKey",
  ] as const;
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
      accessKey: atob(secret.data.accessKey),
      bucket: atob(secret.data.bucket),
      external: atob(secret.data.external),
      internal: atob(secret.data.internal),
      secretKey: atob(secret.data.secretKey),
    };
  } catch (error) {
    throw new Error("Failed to decode base64 secret data");
  }
}

/**
 * Validate object storage credentials structure
 * @param credentials - Credentials to validate
 * @returns True if valid, throws error if invalid
 */
export function validateObjectStorageCredentials(
  credentials: ObjectStorageCredentials
): boolean {
  const requiredFields = [
    "accessKey",
    "bucket",
    "external",
    "internal",
    "secretKey",
  ];

  for (const field of requiredFields) {
    if (!credentials[field as keyof ObjectStorageCredentials]) {
      throw new Error(`Invalid credentials: missing ${field}`);
    }
  }

  // Validate endpoint URLs
  try {
    new URL(`https://${credentials.external}`);
    // Note: internal might be a cluster-local address, so we don't validate it as a full URL
  } catch (error) {
    throw new Error("Invalid external endpoint URL");
  }

  return true;
}

/**
 * Create S3-compatible configuration from object storage credentials
 * @param credentials - Object storage credentials
 * @param useInternalEndpoint - Whether to use internal endpoint (default: false)
 * @returns S3 configuration object
 */
export function createS3Config(
  credentials: ObjectStorageCredentials,
  useInternalEndpoint: boolean = false
) {
  validateObjectStorageCredentials(credentials);

  const endpoint = useInternalEndpoint
    ? credentials.internal
    : credentials.external;

  return {
    accessKeyId: credentials.accessKey,
    secretAccessKey: credentials.secretKey,
    bucket: credentials.bucket,
    endpoint: `https://${endpoint}`,
    region: "auto", // Sealos object storage typically uses 'auto'
    s3ForcePathStyle: true, // Required for most S3-compatible services
  };
}

/**
 * Create MinIO client configuration from object storage credentials
 * @param credentials - Object storage credentials
 * @param useInternalEndpoint - Whether to use internal endpoint (default: false)
 * @returns MinIO client configuration
 */
export function createMinioConfig(
  credentials: ObjectStorageCredentials,
  useInternalEndpoint: boolean = false
) {
  validateObjectStorageCredentials(credentials);

  const endpoint = useInternalEndpoint
    ? credentials.internal
    : credentials.external;

  return {
    endPoint: endpoint,
    port: 443,
    useSSL: true,
    accessKey: credentials.accessKey,
    secretKey: credentials.secretKey,
    bucket: credentials.bucket,
  };
}

/**
 * Get the object storage endpoints
 * @param credentials - Object storage credentials
 * @returns Object with external and internal endpoints
 */
export function getObjectStorageEndpoints(
  credentials: ObjectStorageCredentials
) {
  validateObjectStorageCredentials(credentials);

  return {
    external: `https://${credentials.external}`,
    internal: `https://${credentials.internal}`,
    bucket: credentials.bucket,
  };
}

/**
 * Create a signed URL configuration helper
 * @param credentials - Object storage credentials
 * @param useInternalEndpoint - Whether to use internal endpoint (default: false)
 * @returns Configuration for generating signed URLs
 */
export function createSignedUrlConfig(
  credentials: ObjectStorageCredentials,
  useInternalEndpoint: boolean = false
) {
  const s3Config = createS3Config(credentials, useInternalEndpoint);

  return {
    ...s3Config,
    signatureVersion: "v4",
  };
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
 * Create environment variables for object storage connection
 * @param secretName - Name of the object storage secret
 * @param objectStorageName - Name of the object storage bucket
 * @returns Array of environment variables for object storage connection
 */
export function createObjectStorageEnvVars(
  secretName: string,
  objectStorageName: string
): EnvVar[] {
  const prefix = objectStorageName.toUpperCase().replace(/[^A-Z0-9]/g, "_");
  return [
    {
      type: "secretKeyRef",
      key: `${prefix}_S3_ACCESS_KEY`,
      secretName,
      secretKey: "accessKey",
    },
    {
      type: "secretKeyRef",
      key: `${prefix}_S3_SECRET_KEY`,
      secretName,
      secretKey: "secretKey",
    },
    {
      type: "secretKeyRef",
      key: `${prefix}_S3_BUCKET`,
      secretName,
      secretKey: "bucket",
    },
    {
      type: "secretKeyRef",
      key: `${prefix}_S3_ENDPOINT_EXTERNAL`,
      secretName,
      secretKey: "external",
    },
    {
      type: "secretKeyRef",
      key: `${prefix}_S3_ENDPOINT_INTERNAL`,
      secretName,
      secretKey: "internal",
    },
  ];
}
