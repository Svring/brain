import type { Env } from "@/schemas/forms/universal/env-schema";

/**
 * Derives environment variables from object storage access configuration
 * @param name - The object storage name used to generate environment variable names and secret references
 * @returns An array of environment variables conforming to EnvSchema
 */
export const deriveObjectStorageEnvVariable = (name: string): Env[] => {
  const secretName = `object-storage-key-${name}`;
  const secretKeys = [
    "accessKey",
    "bucket",
    "external",
    "internal",
    "secretKey",
  ];

  return secretKeys.map((key) => ({
    name: `${name.toUpperCase()}_${key.toUpperCase()}`,
    valueFrom: {
      secretKeyRef: {
        name: secretName,
        key: key,
      },
    },
  }));
};
